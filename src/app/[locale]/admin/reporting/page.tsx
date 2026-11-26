import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import {
  resendReport,
  runBatchNow,
  updateCitation,
} from "@/lib/admin/reporting-actions";
import { createServiceClient } from "@/lib/supabase/service";

const PAGE_SIZE = 25;
const STATUSES = ["queued", "sent", "accepted", "rejected", "error"] as const;

const SELECT =
  "id, status, attempts, error, regulator_ref, created_at, sent_at, accepted_at, certificates(cert_no, enrollments(id, citation_no))";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/reporting">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.reporting" });
  return { title: t("title") };
}

export default async function AdminReportingPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/reporting">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.reporting" }),
    getTranslations({ locale, namespace: "Admin.common" }),
  ]);
  const service = createServiceClient();

  const [batches, queue, list] = await Promise.all([
    service
      .from("report_batches")
      .select("id, started_at, finished_at, trigger, counts")
      .order("started_at", { ascending: false })
      .limit(10),
    service
      .from("completion_reports")
      .select(SELECT)
      .in("status", ["rejected", "error"])
      .order("updated_at", { ascending: false })
      .limit(50),
    (() => {
      let q = service
        .from("completion_reports")
        .select(SELECT)
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
      if (status) q = q.eq("status", status);
      return q;
    })(),
  ]);

  const certOf = (r: { certificates: unknown }) => {
    const c = Array.isArray(r.certificates)
      ? r.certificates[0]
      : r.certificates;
    return c as
      | {
          cert_no: string;
          enrollments: { id: string; citation_no: string | null } | null;
        }
      | undefined;
  };
  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(locale) : "-";

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <div className="flex gap-3">
          <a
            href="/api/admin/reports.csv"
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            {t("exportCsv")}
          </a>
          <form action={runBatchNow}>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              {t("runNow")}
            </button>
          </form>
        </div>
      </div>

      <h2 className="mt-8 text-xl font-semibold">{t("queueHeading")}</h2>
      {(queue.data ?? []).length === 0 ? (
        <p className="mt-2 text-muted-foreground">{t("queueEmpty")}</p>
      ) : (
        <ul className="mt-3 space-y-4">
          {(queue.data ?? []).map((r) => {
            const cert = certOf(r);
            const enrollment = cert?.enrollments;
            return (
              <li key={r.id} className="rounded-md border p-4">
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-mono">{cert?.cert_no}</span>
                  <StatusBadge status={r.status} />
                  <span className="text-muted-foreground">
                    {r.error ?? ""} ({t("attempts", { count: r.attempts })})
                  </span>
                </p>
                <div className="mt-3 flex flex-col gap-3">
                  {enrollment ? (
                    <ConfirmForm
                      action={updateCitation}
                      hidden={{ enrollmentId: enrollment.id }}
                      submitLabel={t("saveCitation")}
                      reasonLabel={tc("reason")}
                    >
                      <label className="flex flex-col gap-1 text-sm">
                        {t("citation")}
                        <input
                          name="citationNo"
                          defaultValue={enrollment.citation_no ?? ""}
                          required
                          className="rounded-md border bg-background px-2 py-1"
                        />
                      </label>
                    </ConfirmForm>
                  ) : null}
                  <ConfirmForm
                    action={resendReport}
                    hidden={{ reportId: r.id }}
                    submitLabel={t("resend")}
                    reasonLabel={tc("reason")}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-xl font-semibold">{t("reportsHeading")}</h2>
      <nav className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
        <Link href="/admin/reporting" className={status ? "" : "underline"}>
          {t("all")}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={{ pathname: "/admin/reporting", query: { status: s } }}
            className={status === s ? "underline" : ""}
          >
            {s}
          </Link>
        ))}
      </nav>
      <DataTable
        locale={locale}
        rows={list.data ?? []}
        rowKey={(r) => r.id}
        basePath="/admin/reporting"
        page={page}
        pageSize={PAGE_SIZE}
        extraParams={status ? { status } : undefined}
        columns={[
          { header: t("cert"), cell: (r) => certOf(r)?.cert_no ?? "-" },
          {
            header: tc("status"),
            cell: (r) => <StatusBadge status={r.status} />,
          },
          { header: t("ref"), cell: (r) => r.regulator_ref ?? "-" },
          { header: t("sentAt"), cell: (r) => when(r.sent_at) },
          { header: t("acceptedAt"), cell: (r) => when(r.accepted_at) },
        ]}
      />

      <h2 className="mt-10 text-xl font-semibold">{t("batchesHeading")}</h2>
      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 pr-4 font-medium">{t("startedAt")}</th>
            <th className="py-2 pr-4 font-medium">{t("trigger")}</th>
            <th className="py-2 pr-4 font-medium">{t("counts")}</th>
          </tr>
        </thead>
        <tbody>
          {(batches.data ?? []).map((b) => (
            <tr key={b.id} className="border-b">
              <td className="py-2 pr-4">{when(b.started_at)}</td>
              <td className="py-2 pr-4">{b.trigger}</td>
              <td className="py-2 pr-4 font-mono">
                {JSON.stringify(b.counts)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
