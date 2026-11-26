import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/admin-write";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

const cell = (value: unknown) => {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote, and defuse spreadsheet formulas.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replaceAll('"', '""')}"`;
};

/** Admin only: every completion report as CSV. */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { data, error } = await createServiceClient()
    .from("completion_reports")
    .select(
      "id, status, attempts, regulator_ref, error, created_at, sent_at, accepted_at, rejected_at, certificates(cert_no)",
    )
    .order("created_at", { ascending: false })
    .limit(10000);
  if (error) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
  const header = [
    "id",
    "cert_no",
    "status",
    "attempts",
    "regulator_ref",
    "error",
    "created_at",
    "sent_at",
    "accepted_at",
    "rejected_at",
  ];
  const lines = (data ?? []).map((r) => {
    const c = Array.isArray(r.certificates)
      ? r.certificates[0]
      : r.certificates;
    return [
      r.id,
      c?.cert_no,
      r.status,
      r.attempts,
      r.regulator_ref,
      r.error,
      r.created_at,
      r.sent_at,
      r.accepted_at,
      r.rejected_at,
    ]
      .map(cell)
      .join(",");
  });
  return new NextResponse([header.join(","), ...lines].join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="reports.csv"',
    },
  });
}
