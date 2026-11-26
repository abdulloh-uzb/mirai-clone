import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";
import { MAX_ATTEMPTS, nextBackoff } from "./schedule";
import type { CompletionPayload, StateReportingAdapter } from "./types";

export type ReportStatusChange = {
  reportId: string;
  userId: string;
  status: "sent" | "accepted" | "rejected";
};

export type BatchDeps = {
  service: SupabaseClient<Database>;
  adapterFor: (name: string | null) => StateReportingAdapter;
  /** Called after a status change. Failures are logged, never fatal. */
  notify?: (change: ReportStatusChange) => Promise<void>;
};

export type BatchCounts = {
  checked: number;
  accepted: number;
  rejected: number;
  submitted: number;
  sent: number;
  errors: number;
};

type Row = {
  id: string;
  status: string;
  attempts: number;
  certNo: string;
  userId: string;
  adapter: string | null;
  payload: CompletionPayload;
};

async function loadRows(
  service: SupabaseClient<Database>,
  statuses: string[],
): Promise<Row[]> {
  const { data, error } = await service
    .from("completion_reports")
    .select(
      "id, status, attempts, next_attempt_at, certificates(cert_no, enrollments(user_id, citation_no, completed_at, counties(name, slug), courses(states(adapter))))",
    )
    .in("status", statuses);
  if (error) throw error;
  const rows: Row[] = [];
  for (const r of data ?? []) {
    const cert = r.certificates;
    const e = cert?.enrollments;
    if (!cert || !e) continue;
    const { data: profile } = await service
      .from("profiles")
      .select(
        "first_name, last_name, legal_name, dob, license_no, license_state",
      )
      .eq("user_id", e.user_id)
      .single();
    rows.push({
      id: r.id,
      status: r.status,
      attempts: r.attempts,
      certNo: cert.cert_no,
      userId: e.user_id,
      adapter: e.courses?.states?.adapter ?? null,
      payload: {
        reportId: r.id,
        certNo: cert.cert_no,
        legalName:
          profile?.legal_name ??
          `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim(),
        dob: profile?.dob ?? null,
        licenseNo: profile?.license_no ?? null,
        licenseState: profile?.license_state ?? null,
        courtCode: e.counties?.slug ?? null,
        countyName: e.counties?.name ?? null,
        citationNo: e.citation_no,
        completedAt: e.completed_at,
      },
    });
  }
  return rows;
}

/**
 * One reporting batch: confirm what was sent last time, then submit queued
 * reports and errors that are due for a retry. Every request and response is
 * saved in report_attempts.
 */
export async function runBatch(
  deps: BatchDeps,
  input: { trigger: "cron" | "manual"; now: Date },
): Promise<BatchCounts> {
  const { service } = deps;
  const { now } = input;
  const iso = now.toISOString();
  const counts: BatchCounts = {
    checked: 0,
    accepted: 0,
    rejected: 0,
    submitted: 0,
    sent: 0,
    errors: 0,
  };

  const { data: batch, error: batchError } = await service
    .from("report_batches")
    .insert({ trigger: input.trigger, started_at: iso })
    .select("id")
    .single();
  if (batchError) throw batchError;

  const log = async (reportId: string, request: unknown, response: unknown) => {
    const { error } = await service.from("report_attempts").insert({
      report_id: reportId,
      request: request as NonNullable<Json>,
      response: response as Json,
      at: iso,
    });
    if (error) throw error;
  };
  const notify = async (change: ReportStatusChange) => {
    try {
      await deps.notify?.(change);
    } catch (e) {
      console.error("report status email failed", e);
    }
  };

  // Step 1: sent -> accepted / rejected.
  const sentRows = await loadRows(service, ["sent"]);
  for (const [name, rows] of groupByAdapter(sentRows)) {
    const adapter = deps.adapterFor(name);
    const ids = rows.map((r) => r.id);
    const results = await adapter.checkStatus(ids);
    counts.checked += ids.length;
    for (const res of results) {
      const row = rows.find((r) => r.id === res.reportId);
      if (!row) continue;
      await log(row.id, { op: "checkStatus", ids: [row.id] }, res);
      if (res.status === "accepted") {
        counts.accepted++;
        // TODO(spec): the mock notifies the court together with the DMV acceptance.
        await update(service, row.id, {
          status: "accepted",
          accepted_at: iso,
          court_notified_at: iso,
          ...(res.regulatorRef ? { regulator_ref: res.regulatorRef } : {}),
        });
        await notify({
          reportId: row.id,
          userId: row.userId,
          status: "accepted",
        });
      } else if (res.status === "rejected") {
        counts.rejected++;
        await update(service, row.id, {
          status: "rejected",
          rejected_at: iso,
          error: res.reason ?? "Rejected",
        });
        await notify({
          reportId: row.id,
          userId: row.userId,
          status: "rejected",
        });
      }
    }
  }

  // Step 2: queued, and errors that are due, -> submit.
  const candidates = (await loadRows(service, ["queued", "error"])).filter(
    (r) => r.status === "queued" || r.attempts < MAX_ATTEMPTS,
  );
  const { data: dueRows, error: dueError } = await service
    .from("completion_reports")
    .select("id, status, next_attempt_at")
    .in(
      "id",
      candidates.map((c) => c.id),
    );
  if (dueError) throw dueError;
  const due = new Set(
    (dueRows ?? [])
      .filter(
        (r) =>
          r.status === "queued" ||
          (r.next_attempt_at !== null && r.next_attempt_at <= iso),
      )
      .map((r) => r.id),
  );
  const toSend = candidates.filter((c) => due.has(c.id));
  for (const [name, rows] of groupByAdapter(toSend)) {
    const adapter = deps.adapterFor(name);
    const items = rows.map((r) => r.payload);
    let results;
    try {
      results = await adapter.submitCompletions(items);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "Adapter failed";
      results = rows.map((r) => ({
        reportId: r.id,
        status: "error" as const,
        reason,
      }));
    }
    counts.submitted += rows.length;
    for (const row of rows) {
      const res =
        results.find((x) => x.reportId === row.id) ??
        ({ reportId: row.id, status: "error", reason: "No response" } as const);
      await log(row.id, { op: "submitCompletions", item: row.payload }, res);
      const attempts = row.attempts + 1;
      const base = { batch_id: batch.id, attempts };
      if (res.status === "sent" || res.status === "accepted") {
        counts.sent++;
        await update(service, row.id, {
          ...base,
          status: "sent",
          sent_at: iso,
          next_attempt_at: null,
          error: null,
          regulator_ref: res.regulatorRef ?? null,
        });
        await notify({ reportId: row.id, userId: row.userId, status: "sent" });
      } else if (res.status === "rejected") {
        counts.rejected++;
        await update(service, row.id, {
          ...base,
          status: "rejected",
          rejected_at: iso,
          error: res.reason ?? "Rejected",
        });
        await notify({
          reportId: row.id,
          userId: row.userId,
          status: "rejected",
        });
      } else {
        counts.errors++;
        await update(service, row.id, {
          ...base,
          status: "error",
          error: res.reason ?? "Error",
          next_attempt_at: new Date(
            now.getTime() + nextBackoff(attempts) * 60_000,
          ).toISOString(),
        });
      }
    }
  }

  const { error: finishError } = await service
    .from("report_batches")
    .update({ finished_at: new Date().toISOString(), counts: { ...counts } })
    .eq("id", batch.id);
  if (finishError) throw finishError;
  return counts;
}

async function update(
  service: SupabaseClient<Database>,
  id: string,
  values: Database["public"]["Tables"]["completion_reports"]["Update"],
) {
  const { error } = await service
    .from("completion_reports")
    .update(values)
    .eq("id", id);
  if (error) throw error;
}

function groupByAdapter(rows: Row[]): Map<string | null, Row[]> {
  const map = new Map<string | null, Row[]>();
  for (const r of rows) map.set(r.adapter, [...(map.get(r.adapter) ?? []), r]);
  return map;
}
