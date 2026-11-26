import type { Metadata } from "next";
import { CircleCheckIcon, DownloadIcon, PlayIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { DataTable } from "@/components/admin/data-table";
import { AdminFilterLinks } from "@/components/admin/filter-links";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/button";
import {
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminField } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/table";
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
  const [t, tc, tNav, tDesc, tStatus] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.reporting" }),
    getTranslations({ locale, namespace: "Admin.common" }),
    getTranslations({ locale, namespace: "Admin.nav" }),
    getTranslations({ locale, namespace: "Admin.descriptions" }),
    getTranslations({ locale, namespace: "Admin.statuses" }),
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

  const queueRows = queue.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("reporting")}
        description={tDesc("reporting")}
        actions={
          <>
            <a
              href="/api/admin/reports.csv"
              className={adminButtonVariants({
                variant: "outline",
                size: "sm",
              })}
            >
              <DownloadIcon aria-hidden />
              {t("exportCsv")}
            </a>
            <form action={runBatchNow}>
              <AdminButton type="submit" size="sm">
                <PlayIcon aria-hidden />
                {t("runNow")}
              </AdminButton>
            </form>
          </>
        }
      />

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>{t("queueHeading")}</AdminCardTitle>
          <AdminBadge tone={queueRows.length ? "danger" : "neutral"}>
            {queueRows.length}
          </AdminBadge>
        </AdminCardHeader>
        {queueRows.length === 0 ? (
          <AdminEmpty icon={CircleCheckIcon} title={t("queueEmpty")} />
        ) : (
          <ul className="divide-y">
            {queueRows.map((r) => {
              const cert = certOf(r);
              const enrollment = cert?.enrollments;
              return (
                <li key={r.id} className="flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono text-xs font-medium">
                      {cert?.cert_no}
                    </span>
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-muted-foreground">
                      {t("attempts", { count: r.attempts })}
                    </span>
                  </div>
                  {r.error ? (
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {r.error}
                    </p>
                  ) : null}
                  {enrollment ? (
                    <ConfirmForm
                      action={updateCitation}
                      hidden={{ enrollmentId: enrollment.id }}
                      submitLabel={t("saveCitation")}
                      reasonLabel={tc("reason")}
                      tone="primary"
                    >
                      <AdminField label={t("citation")}>
                        <AdminInput
                          name="citationNo"
                          defaultValue={enrollment.citation_no ?? ""}
                          required
                          className="sm:w-56"
                        />
                      </AdminField>
                    </ConfirmForm>
                  ) : null}
                  <ConfirmForm
                    action={resendReport}
                    hidden={{ reportId: r.id }}
                    submitLabel={t("resend")}
                    reasonLabel={tc("reason")}
                    tone="secondary"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </AdminCard>

      <DataTable
        locale={locale}
        title={t("reportsHeading")}
        toolbar={
          <AdminFilterLinks
            label={t("reportsHeading")}
            items={[
              {
                key: "all",
                href: "/admin/reporting",
                label: t("all"),
                active: !status,
              },
              ...STATUSES.map((s) => ({
                key: s,
                href: { pathname: "/admin/reporting", query: { status: s } },
                label: tStatus(s),
                active: status === s,
              })),
            ]}
          />
        }
        rows={list.data ?? []}
        rowKey={(r) => r.id}
        basePath="/admin/reporting"
        page={page}
        pageSize={PAGE_SIZE}
        extraParams={status ? { status } : undefined}
        columns={[
          {
            header: t("cert"),
            cell: (r) => certOf(r)?.cert_no ?? "-",
            className: "font-mono text-xs",
          },
          {
            header: tc("status"),
            cell: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: t("ref"),
            cell: (r) => r.regulator_ref ?? "-",
            className: "font-mono text-xs",
          },
          {
            header: t("sentAt"),
            cell: (r) => when(r.sent_at),
            className: "tabular-nums",
          },
          {
            header: t("acceptedAt"),
            cell: (r) => when(r.accepted_at),
            className: "tabular-nums",
          },
        ]}
      />

      <AdminCard className="overflow-hidden">
        <AdminCardHeader>
          <AdminCardTitle>{t("batchesHeading")}</AdminCardTitle>
        </AdminCardHeader>
        {(batches.data ?? []).length ? (
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead>{t("startedAt")}</AdminTableHead>
                <AdminTableHead>{t("trigger")}</AdminTableHead>
                <AdminTableHead>{t("counts")}</AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {(batches.data ?? []).map((b) => (
                <AdminTableRow key={b.id}>
                  <AdminTableCell className="tabular-nums">
                    {when(b.started_at)}
                  </AdminTableCell>
                  <AdminTableCell>{b.trigger}</AdminTableCell>
                  <AdminTableCell className="font-mono text-xs whitespace-normal">
                    {JSON.stringify(b.counts)}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        ) : (
          <AdminEmpty title={tc("nothingYet")} />
        )}
      </AdminCard>
    </div>
  );
}
