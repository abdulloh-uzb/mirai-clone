import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
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
      className="size-32 shrink-0"
    >
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="10"
        className="stroke-muted"
      />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
        transform="rotate(-90 60 60)"
        className="stroke-primary"
      />
      <text
        x="60"
        y="66"
        textAnchor="middle"
        className="fill-foreground text-2xl font-bold"
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

  return (
    <section className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

      {enrollment.status === "paused" ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3"
        >
          {t("paused")}
        </p>
      ) : null}
      {enrollment.status === "locked" ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3"
        >
          {t("locked")}
        </p>
      ) : null}
      {enrollment.status === "expired" ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3"
        >
          {t("expired")}
        </p>
      ) : null}
      {usable && banner ? (
        <p
          role="status"
          data-testid="access-banner"
          className="mt-6 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3"
        >
          {t(`accessBanner.d${banner}`, { days })}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-6 rounded-xl border bg-card p-6">
          <ProgressRing pct={pct} label={t("progressLabel", { pct })} />
          <div>
            <p className="text-sm text-muted-foreground">
              {t("currentSection")}
            </p>
            <p className="font-semibold">
              {next
                ? `${next.section.position}. ${next.section.title}`
                : t("allDone")}
            </p>
            {usable && continueHref && !readOnly ? (
              <Button asChild className="mt-4">
                <Link href={continueHref}>{t("continue")}</Link>
              </Button>
            ) : null}
            {usable && !next && allSectionsDone ? (
              <Button asChild className="mt-4">
                <Link href={`/portal/exam/${enrollment.id}`}>
                  {t("toExam")}
                </Link>
              </Button>
            ) : null}
            {enrollment.status === "completed" ? (
              <Button asChild className="mt-4">
                <Link href="/portal/certificates">{t("getCertificate")}</Link>
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="grid gap-4 rounded-xl border bg-card p-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">{t("daysLeft")}</dt>
            <dd className="text-lg font-semibold">
              {t("daysOf", { days, total: ACCESS_DAYS })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              {t("courseLanguage")}
            </dt>
            <dd className="text-lg font-semibold">{language?.nativeName}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">
              {t("courtDueDate")}
            </dt>
            <dd
              className={cn(
                "text-lg font-semibold",
                warning && "text-destructive",
              )}
            >
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
              <p className="text-sm text-destructive">{t("dueSoon")}</p>
            ) : null}
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">{t("reporting")}</dt>
            {/* TODO(spec): ticket 09 shows the real reporting status here. */}
            <dd className="text-lg font-semibold">
              {t("reportingPlaceholder")}
            </dd>
          </div>
        </dl>
      </div>

      {!hasDetails && usable ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {t("detailsFirst")}
        </p>
      ) : null}
    </section>
  );
}
