import type { Metadata } from "next";
import {
  ClipboardListIcon,
  DollarSignIcon,
  PercentIcon,
  SendIcon,
} from "lucide-react";
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActivityChart } from "@/components/admin/dashboard/activity-chart";
import { AttentionList } from "@/components/admin/dashboard/attention-list";
import { KpiCard } from "@/components/admin/dashboard/kpi-card";
import { RecentStudents } from "@/components/admin/dashboard/recent-students";
import { StageCards } from "@/components/admin/dashboard/stage-cards";
import {
  AdminCard,
  AdminCardContent,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { routing } from "@/i18n/routing";
import { loadDashboard } from "@/lib/admin/dashboard";
import { passRatePct, reportsWaiting } from "@/lib/admin/dashboard-stats";
import { toActivityPoints } from "@/lib/admin/dashboard-view";
import { formatUsd } from "@/lib/courses/courses";

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
  const [t, format, data] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    getFormatter({ locale }),
    loadDashboard(),
  ]);
  if (!data) notFound();
  const now = new Date();
  const s = data.stats;
  const w = reportsWaiting(s);
  const pass = passRatePct(s);
  const points = toActivityPoints(data.activity, (day) =>
    format.dateTime(new Date(`${day}T00:00:00Z`), {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }),
  );
  const totalCents = data.activity.reduce((n, r) => n + r.sales_cents, 0);
  const totalEnrollments = data.activity.reduce((n, r) => n + r.enrollments, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("nav.dashboard")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </div>
      <section aria-labelledby="dash-kpis">
        <h2 id="dash-kpis" className="sr-only">
          {t("dashboard.kpiHeading")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={DollarSignIcon}
            label={t("dashboard.sales30")}
            value={formatUsd(s.sales_cents.d30, locale)}
            hint={t("dashboard.windowHint", {
              today: formatUsd(s.sales_cents.today, locale),
              d7: formatUsd(s.sales_cents.d7, locale),
            })}
          />
          <KpiCard
            icon={ClipboardListIcon}
            label={t("dashboard.enrollments30")}
            value={format.number(s.enrollments.d30)}
            hint={t("dashboard.windowHint", {
              today: format.number(s.enrollments.today),
              d7: format.number(s.enrollments.d7),
            })}
          />
          <KpiCard
            icon={PercentIcon}
            label={t("dashboard.passRate")}
            value={pass === null ? t("dashboard.noData") : `${pass}%`}
            hint={t("dashboard.passRateHint", {
              passed: s.exam_passed,
              submitted: s.exam_submitted,
            })}
          />
          <KpiCard
            icon={SendIcon}
            href="/admin/reporting"
            label={t("dashboard.reportsWaiting")}
            value={format.number(w.total)}
            hint={t("dashboard.reportsWaitingHint", {
              queued: w.queued,
              sent: w.sent,
            })}
          />
        </div>
      </section>
      <StageCards counts={data.stageCounts} />
      <AttentionList locale={locale} groups={data.attention} now={now} />
      <div className="grid gap-6 xl:grid-cols-3">
        <AdminCard className="xl:col-span-2">
          <AdminCardHeader>
            <div>
              <AdminCardTitle>{t("dashboard.chartHeading")}</AdminCardTitle>
              <AdminCardDescription>
                {t("dashboard.chartDescription")}
              </AdminCardDescription>
            </div>
          </AdminCardHeader>
          <AdminCardContent>
            <p className="sr-only">
              {t("dashboard.chartSummary", {
                sales: formatUsd(totalCents, locale),
                enrollments: totalEnrollments,
              })}
            </p>
            <ActivityChart
              points={points}
              locale={locale}
              salesLabel={t("dashboard.sales")}
              enrollmentsLabel={t("dashboard.newEnrollments")}
            />
          </AdminCardContent>
        </AdminCard>
        <RecentStudents locale={locale} rows={data.recent} />
      </div>
    </div>
  );
}
