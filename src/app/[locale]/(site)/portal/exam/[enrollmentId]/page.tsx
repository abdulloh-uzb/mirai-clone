import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ExamRunner, type ConfirmDetails } from "@/components/exam/exam-runner";
import { CircleDashedIcon } from "lucide-react";
import { LmsHero, LmsWrap, type LmsArt } from "@/components/layout/lms-page";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
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

  const shell = (
    children: React.ReactNode,
    examActive = false,
    art?: LmsArt,
  ) => (
    <main data-exam-active={examActive ? "true" : undefined}>
      <LmsHero title={t("heading")} art={art} />
      <LmsWrap className="max-w-3xl py-8 sm:py-10">{children}</LmsWrap>
    </main>
  );

  // Review of a passed attempt.
  if (wantsReview && e.passed && e.latest?.passed) {
    const rev = await getExamReview({ attemptId: e.latest.attemptId });
    if (rev.ok) {
      return shell(
        <div className="grid gap-5">
          <Notice tone="success">
            <p className="text-xl font-extrabold tracking-tight">
              {t("score", {
                score: rev.review.score,
                total: rev.review.total,
              })}
            </p>
          </Notice>
          {rev.review.questions.map((q, i) => (
            <section
              key={q.id}
              className="grid gap-2.5 rounded-[22px] border border-line-blue bg-card p-5 sm:p-6"
            >
              <h2 className="mb-1 text-xl leading-snug font-extrabold tracking-tight text-balance">
                {i + 1}. {q.text}
              </h2>
              {q.options.map((o) => (
                <p
                  key={o.id}
                  className="lms-choice cursor-default"
                  data-tone={
                    o.correct
                      ? "right"
                      : q.chosenOptionId === o.id
                        ? "wrong"
                        : undefined
                  }
                >
                  {o.text}
                </p>
              ))}
              {q.explanation ? (
                <p className="mt-1 rounded-[16px] bg-hero px-4 py-3 text-[16px] text-muted-foreground">
                  {q.explanation}
                </p>
              ) : null}
            </section>
          ))}
          <Button asChild size="lg" className="justify-self-start">
            <Link href="/portal/certificates">{t("getCertificate")}</Link>
          </Button>
        </div>,
        false,
        "certificate",
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
      <div
        className={cn(
          "grid gap-4 rounded-[22px] border-t-[6px] border-b-[6px] bg-card p-6 shadow-panel sm:p-8",
          e.passed
            ? "border-t-brand-sky border-b-brand-green"
            : "border-t-alert-line border-b-alert-line",
        )}
        data-testid="exam-finished"
      >
        <p className="text-[28px] leading-tight font-extrabold tracking-tight">
          {t("score", { score: e.latest.score ?? 0, total: e.latest.total })}
        </p>
        <p className="text-lg">{e.passed ? t("passed") : t("locked")}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {e.passed ? (
            <>
              <Button asChild size="lg">
                <Link href="/portal/certificates">{t("getCertificate")}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/portal/exam/${enrollmentId}?review=1`}>
                  {t("viewAnswers")}
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">{t("contactSupport")}</Link>
            </Button>
          )}
        </div>
      </div>,
      false,
      e.passed ? "finish" : undefined,
    );
  }

  // Not eligible: checklist with links.
  if (!e.eligible) {
    return shell(
      <section
        className="grid gap-5 rounded-[22px] border border-line-blue bg-card p-6 sm:p-8"
        data-testid="exam-not-eligible"
      >
        <p className="text-xl font-extrabold tracking-tight">
          {t("notEligible")}
        </p>
        <ul className="grid gap-2.5">
          {e.reasons.map((r) => (
            <li
              key={r}
              className="flex items-start gap-3 rounded-[16px] bg-hero px-4 py-3 text-[17px]"
            >
              <CircleDashedIcon
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-blue-text"
              />
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
          <Button asChild size="lg">
            <Link href="/portal">{t("continueCourse")}</Link>
          </Button>
          {e.reasons.includes("details_required") ? (
            <Button asChild size="lg" variant="outline">
              <Link
                href={`/portal/details/${enrollmentId}?next=${encodeURIComponent(`/portal/exam/${enrollmentId}`)}`}
              >
                {t("enterDetails")}
              </Link>
            </Button>
          ) : null}
        </div>
      </section>,
      false,
      "exam",
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
