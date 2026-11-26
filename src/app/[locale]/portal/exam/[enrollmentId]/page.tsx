import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExamRunner, type ConfirmDetails } from "@/components/exam/exam-runner";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getDriverDetails } from "@/lib/portal/details";
import {
  getExamEligibility,
  getExamReview,
  startExam,
} from "@/lib/portal/exam-actions";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/exam/[enrollmentId]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Exam" });
  return { title: t("title") };
}

const REASON_KEYS = {
  sections_incomplete: "sectionsIncomplete",
  min_time: "minTime",
  details_required: "detailsRequired",
  no_attempts_left: "noAttemptsLeft",
  not_active: "notActive",
  already_passed: "alreadyPassed",
} as const;

export default async function ExamPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal/exam/[enrollmentId]">) {
  const { locale, enrollmentId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Exam" });
  const wantsReview = (await searchParams).review === "1";

  const elig = await getExamEligibility({ enrollmentId });
  if (!elig.ok) notFound();
  const e = elig.eligibility;

  const shell = (children: React.ReactNode, examActive = false) => (
    <main
      className="mx-auto max-w-3xl px-4 py-8"
      data-exam-active={examActive ? "true" : undefined}
    >
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("heading")}</h1>
      {children}
    </main>
  );

  // Review of a passed attempt.
  if (wantsReview && e.passed && e.latest?.passed) {
    const rev = await getExamReview({ attemptId: e.latest.attemptId });
    if (rev.ok) {
      return shell(
        <div className="space-y-4">
          <p className="font-semibold">
            {t("score", { score: rev.review.score, total: rev.review.total })}
          </p>
          {rev.review.questions.map((q, i) => (
            <section key={q.id} className="space-y-2 rounded-xl border p-4">
              <h2 className="font-semibold">
                {i + 1}. {q.text}
              </h2>
              {q.options.map((o) => (
                <p
                  key={o.id}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    o.correct && "border-brand-green bg-brand-green/10",
                    !o.correct &&
                      q.chosenOptionId === o.id &&
                      "border-destructive bg-destructive/10",
                  )}
                >
                  {o.text}
                </p>
              ))}
              {q.explanation ? (
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              ) : null}
            </section>
          ))}
          <Button asChild>
            <Link href="/portal/certificates">{t("getCertificate")}</Link>
          </Button>
        </div>,
      );
    }
  }

  // Finished: show the last result.
  if (
    !e.eligible &&
    e.latest &&
    (e.passed ||
      e.reasons.includes("no_attempts_left") ||
      e.reasons.includes("not_active"))
  ) {
    return shell(
      <div className="space-y-4" data-testid="exam-finished">
        <p className="text-xl font-semibold">
          {t("score", { score: e.latest.score ?? 0, total: e.latest.total })}
        </p>
        <p>{e.passed ? t("passed") : t("locked")}</p>
        <div className="flex flex-wrap gap-3">
          {e.passed ? (
            <>
              <Button asChild variant="outline">
                <Link href={`/portal/exam/${enrollmentId}?review=1`}>
                  {t("viewAnswers")}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/portal/certificates">{t("getCertificate")}</Link>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href="/contact">{t("contactSupport")}</Link>
            </Button>
          )}
        </div>
      </div>,
    );
  }

  // Not eligible: checklist with links.
  if (!e.eligible) {
    return shell(
      <section className="space-y-4" data-testid="exam-not-eligible">
        <p>{t("notEligible")}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {e.reasons.map((r) => (
            <li key={r}>
              {t(
                `reasons.${REASON_KEYS[r as keyof typeof REASON_KEYS] ?? "notActive"}`,
                {
                  spent: e.minutesSpent,
                  required: e.minutesRequired,
                },
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/portal">{t("continueCourse")}</Link>
          </Button>
          {e.reasons.includes("details_required") ? (
            <Button asChild variant="outline">
              <Link
                href={`/portal/details/${enrollmentId}?next=${encodeURIComponent(`/portal/exam/${enrollmentId}`)}`}
              >
                {t("enterDetails")}
              </Link>
            </Button>
          ) : null}
        </div>
      </section>,
    );
  }

  // Resume a running attempt.
  let initial = null;
  if (e.activeAttemptId) {
    const res = await startExam({ enrollmentId }, { revalidate: false });
    if (res.ok && res.exam) initial = res.exam;
  }

  const d = await getDriverDetails(enrollmentId);
  if (!d) notFound();
  const details: ConfirmDetails = {
    legalName: d.legalName,
    dob: d.dob,
    licenseMasked: d.licenseNo ? `****${d.licenseNo.slice(-4)}` : "",
    county: d.countySlug,
    citationNo: d.citationNo,
    courtDueDate: d.courtDueDate,
  };

  return shell(
    <ExamRunner
      enrollmentId={enrollmentId}
      initial={initial}
      details={details}
      attemptNo={initial?.attemptNo ?? e.attemptsUsed + 1}
    />,
    initial !== null,
  );
}
