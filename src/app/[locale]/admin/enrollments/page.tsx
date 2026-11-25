import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { emailsFor } from "@/lib/admin/emails";
import { createServiceClient } from "@/lib/supabase/service";

const PAGE_SIZE = 25;
const STATUSES = [
  "active",
  "paused",
  "locked",
  "completed",
  "expired",
  "refunded",
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/enrollments">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.enrollments" });
  return { title: t("title") };
}

export default async function AdminEnrollmentsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/enrollments">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const status = STATUSES.find((s) => s === sp.status);
  const page = Math.max(1, Number(sp.page) || 1);
  const t = await getTranslations({ locale, namespace: "Admin.enrollments" });

  let query = createServiceClient()
    .from("enrollments")
    .select("id, user_id, status, course_locale, started_at, expires_at")
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (status) query = query.eq("status", status);
  const { data } = await query;
  const rows = data ?? [];
  const emails = await emailsFor(rows.map((r) => r.user_id));

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <nav
        aria-label={t("filter")}
        className="mt-4 flex flex-wrap gap-2 text-sm"
      >
        <Link href="/admin/enrollments" className="underline">
          {t("all")}
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={{ pathname: "/admin/enrollments", query: { status: s } }}
            className="underline"
          >
            {s}
          </Link>
        ))}
      </nav>
      <DataTable
        locale={locale}
        rows={rows}
        rowKey={(r) => r.id}
        basePath="/admin/enrollments"
        page={page}
        pageSize={PAGE_SIZE}
        extraParams={status ? { status } : undefined}
        columns={[
          {
            header: t("detail"),
            cell: (r) => (
              <Link
                href={`/admin/enrollments/${r.id}`}
                className="font-mono underline"
              >
                {r.id.slice(0, 8)}
              </Link>
            ),
          },
          {
            header: t("user"),
            cell: (r) => (
              <Link href={`/admin/students/${r.user_id}`} className="underline">
                {emails[r.user_id] || r.user_id.slice(0, 8)}
              </Link>
            ),
          },
          { header: t("language"), cell: (r) => r.course_locale },
          {
            header: t("status"),
            cell: (r) => <StatusBadge status={r.status} />,
          },
          {
            header: t("started"),
            cell: (r) => r.started_at?.slice(0, 10) ?? t("notStarted"),
          },
          {
            header: t("expires"),
            cell: (r) => r.expires_at?.slice(0, 10) ?? "—",
          },
        ]}
      />
    </section>
  );
}
