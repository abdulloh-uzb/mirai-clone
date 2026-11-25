import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/admin/stat-card";
import { routing } from "@/i18n/routing";
import {
  avgCompletionDays,
  dashboardStatsSchema,
  passRatePct,
} from "@/lib/admin/dashboard-stats";
import { formatUsd } from "@/lib/courses/courses";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin" });
  return { title: t("title") };
}

export default async function AdminPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Admin" });
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_dashboard_stats");
  const parsed = dashboardStatsSchema.safeParse(data);
  if (!parsed.success) notFound();
  const s = parsed.data;
  const pass = passRatePct(s);
  const days = avgCompletionDays(s);
  const reports = Object.entries(s.reports_by_status);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">
        {t("nav.dashboard")}
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("dashboard.sales")}
          value={formatUsd(s.sales_cents.d30, locale)}
          hint={`${t("dashboard.today")}: ${formatUsd(s.sales_cents.today, locale)} · ${t("dashboard.d7")}: ${formatUsd(s.sales_cents.d7, locale)} · ${t("dashboard.d30")}: ${formatUsd(s.sales_cents.d30, locale)}`}
        />
        <StatCard
          label={t("dashboard.newEnrollments")}
          value={String(s.enrollments.d30)}
          hint={`${t("dashboard.today")}: ${s.enrollments.today} · ${t("dashboard.d7")}: ${s.enrollments.d7} · ${t("dashboard.d30")}: ${s.enrollments.d30}`}
        />
        <StatCard
          label={t("dashboard.passRate")}
          value={pass === null ? t("dashboard.noData") : `${pass}%`}
          hint={`${s.exam_passed} / ${s.exam_submitted}`}
        />
        <StatCard
          label={t("dashboard.avgCompletion")}
          value={
            days === null
              ? t("dashboard.noData")
              : t("dashboard.avgDays", { days })
          }
        />
        <StatCard
          label={t("dashboard.reports")}
          value={
            reports.length
              ? reports.map(([k, n]) => `${k}: ${n}`).join(", ")
              : t("dashboard.noData")
          }
        />
        <StatCard
          label={t("dashboard.refunds")}
          value={t("dashboard.refundsValue", {
            count: s.refunds_30d.count,
            amount: formatUsd(s.refunds_30d.cents, locale),
          })}
        />
        <StatCard
          label={t("dashboard.aiChats")}
          value={String(s.ai_chats_7d)}
        />
      </div>
    </section>
  );
}
