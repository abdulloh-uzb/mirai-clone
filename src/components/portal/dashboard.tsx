import { getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "lucide-react";
import { LmsBody, LmsHero } from "@/components/layout/lms-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Link } from "@/i18n/navigation";
import { languages } from "@/i18n/languages";
import {
  accessBanner,
  daysLeft,
  daysUntilDue,
  dueDateWarning,
} from "@/lib/course/access";
import {
  nextLesson,
  progressPct,
  type OutlineSection,
} from "@/lib/course/outline";
import type { CurrentEnrollment } from "@/lib/portal/enrollment";
import { getReportSummary } from "@/lib/reporting/status";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const ACCESS_DAYS = 90;

function ProgressRing({ pct, label }: { pct: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={label}
      className="size-32 shrink-0 sm:size-36"
    >
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="12"
        className="stroke-hero"
      />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 60 60)"
        className={pct >= 100 ? "stroke-brand-green" : "stroke-primary"}
      />
      <text
        x="60"
        y="68"
        textAnchor="middle"
        className="fill-foreground text-[26px] font-extrabold tracking-tight"
      >
        {pct}%
      </text>
    </svg>
  );
}

/** The enrolled Student's dashboard (spec section 6). */
export async function Dashboard({
  locale,
  enrollment,
  outline,
  hasDetails,
  now,
  readOnly = false,
}: {
  locale: Locale;
  enrollment: CurrentEnrollment;
  outline: OutlineSection[];
  hasDetails: boolean;
  now: Date;
  /** Admin "view as student": no actions are rendered. */
  readOnly?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "Dashboard" });
  const tr = await getTranslations({ locale, namespace: "ReportStatus" });
  const report = readOnly ? null : await getReportSummary(enrollment.id);
  const pct = progressPct(outline);
  const next = nextLesson(outline);
  const days = daysLeft(enrollment.expiresAt, now);
  const banner = accessBanner(days);
  const warning = dueDateWarning(enrollment.courtDueDate, now);
  // Every lesson done and every section quiz passed (the outline mirrors SQL).
  const allSectionsDone =
    outline.length > 0 && outline.every((s) => s.status === "completed");
  const language = languages[enrollment.courseLocale as keyof typeof languages];
  const usable = enrollment.status === "active" && days > 0;

  const continueHref = !hasDetails
    ? `/portal/details/${enrollment.id}?next=${encodeURIComponent(
        next
          ? `/portal/course/${enrollment.id}/${next.section.position}?lesson=${next.lesson.position}`
          : "/portal",
      )}`
    : next
      ? `/portal/course/${enrollment.id}/${next.section.position}?lesson=${next.lesson.position}`
      : null;

  const statusNotice =
    enrollment.status === "paused"
      ? { tone: "warning" as const, text: t("paused") }
      : enrollment.status === "locked"
        ? { tone: "error" as const, text: t("locked") }
        : enrollment.status === "expired"
          ? { tone: "error" as const, text: t("expired") }
          : null;

  const fact = "grid gap-1 rounded-[18px] bg-hero px-4 py-3.5";
  const factLabel = "text-sm font-bold text-muted-foreground";
  const factValue = "text-lg leading-snug font-extrabold";

  return (
    <>
      <LmsHero
        title={t("title")}
        art="lesson"
        intro={!hasDetails && usable ? t("detailsFirst") : undefined}
      >
        {language ? (
          <Badge tone="neutral" className="bg-card">
            {t("courseLanguage")}: {language.nativeName}
          </Badge>
        ) : null}
      </LmsHero>

      <LmsBody className="grid gap-6">
        {statusNotice ? (
          <Notice role="status" tone={statusNotice.tone}>
            {statusNotice.text}
          </Notice>
        ) : null}
        {usable && banner ? (
          <Notice role="status" tone="warning" data-testid="access-banner">
            {t(`accessBanner.d${banner}`, { days })}
          </Notice>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card
            variant="panel"
            padding="lg"
            className="flex-row flex-wrap items-center gap-6"
          >
            <ProgressRing pct={pct} label={t("progressLabel", { pct })} />
            <div className="min-w-0 flex-1 basis-56">
              <p className="text-sm font-bold tracking-[0.12em] text-blue-text uppercase">
                {t("currentSection")}
              </p>
              <p className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight text-balance">
                {next
                  ? `${next.section.position}. ${next.section.title}`
                  : t("allDone")}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {usable && continueHref && !readOnly ? (
                  <Button asChild size="lg">
                    <Link href={continueHref}>
                      {t("continue")}
                      <ArrowRightIcon aria-hidden />
                    </Link>
                  </Button>
                ) : null}
                {usable && !next && allSectionsDone ? (
                  <Button asChild size="lg">
                    <Link href={`/portal/exam/${enrollment.id}`}>
                      {t("toExam")}
                    </Link>
                  </Button>
                ) : null}
                {enrollment.status === "completed" ? (
                  <Button asChild size="lg">
                    <Link href="/portal/certificates">
                      {t("getCertificate")}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className={fact}>
                <dt className={factLabel}>{t("daysLeft")}</dt>
                <dd className={factValue}>
                  {t("daysOf", { days, total: ACCESS_DAYS })}
                </dd>
              </div>
              <div className={fact}>
                <dt className={factLabel}>{t("courseLanguage")}</dt>
                <dd className={factValue}>{language?.nativeName}</dd>
              </div>
              <div
                className={cn(
                  fact,
                  warning && "bg-alert-bg ring-[1.5px] ring-alert-line",
                )}
              >
                <dt className={factLabel}>{t("courtDueDate")}</dt>
                <dd className={cn(factValue, warning && "text-alert")}>
                  {enrollment.courtDueDate
                    ? warning === "overdue"
                      ? t("dueOverdue")
                      : t("dueIn", {
                          days: daysUntilDue(enrollment.courtDueDate, now),
                          date: enrollment.courtDueDate,
                        })
                    : t("dueMissing")}
                </dd>
                {warning === "soon" ? (
                  <p className="text-sm font-semibold text-alert">
                    {t("dueSoon")}
                  </p>
                ) : null}
              </div>
              <div className={fact}>
                <dt className={factLabel}>{t("reporting")}</dt>
                <dd className={factValue}>
                  {report ? (
                    <Link
                      href={`/portal/status/${enrollment.id}`}
                      className="text-blue-text underline underline-offset-3 hover:text-primary"
                    >
                      {tr(`status.${report.status}`)}
                    </Link>
                  ) : (
                    <span className="text-base font-semibold text-muted-foreground">
                      {t("reportingPlaceholder")}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </LmsBody>
    </>
  );
}
