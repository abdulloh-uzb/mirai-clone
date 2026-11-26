"use client";

import {
  AwardIcon,
  CircleAlertIcon,
  PencilIcon,
  TimerIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Link } from "@/i18n/navigation";
import {
  formatRemaining,
  unansweredCount,
  type ExamErrorKey,
  type ExamPayload,
  type ExamResult,
} from "@/lib/exam/exam";
import {
  saveExamAnswer,
  startExam,
  submitExam,
} from "@/lib/portal/exam-actions";
import { cn } from "@/lib/utils";

export type ConfirmDetails = {
  legalName: string;
  dob: string;
  licenseMasked: string;
  county: string;
  citationNo: string;
  courtDueDate: string;
};

/**
 * Confirm-details screen, then the exam: one question per screen, autosave,
 * countdown. No correctness is shown; the result only has score and pass/fail.
 */
export function ExamRunner({
  enrollmentId,
  initial,
  details,
  attemptNo,
}: {
  enrollmentId: string;
  initial: ExamPayload | null;
  details: ConfirmDetails;
  attemptNo: number;
}) {
  const t = useTranslations("Exam");
  const [exam, setExam] = useState(initial);
  const [answers, setAnswers] = useState<Record<string, string>>(
    initial?.answers ?? {},
  );
  const [index, setIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<ExamErrorKey | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [busy, startTransition] = useTransition();

  const expiresAt = exam?.expiresAt;
  useEffect(() => {
    if (!expiresAt || result) return;
    const tick = () => setRemaining(new Date(expiresAt).getTime() - Date.now());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, result]);

  // The AI assistant (ticket 12) reads this to hide itself during an exam.
  const running = exam !== null && result === null;
  useEffect(() => {
    if (!running) return;
    document.documentElement.dataset.examActive = "true";
    return () => {
      delete document.documentElement.dataset.examActive;
    };
  }, [running]);

  function begin() {
    startTransition(async () => {
      const res = await startExam({ enrollmentId });
      if (!res.ok) return setError(res.error);
      if (res.exam) {
        setExam(res.exam);
        setAnswers(res.exam.answers);
        setIndex(0);
        setResult(null);
        setError(null);
      } else setResult(res.finished);
    });
  }

  function choose(questionId: string, optionId: string) {
    if (!exam) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    void saveExamAnswer({ attemptId: exam.attemptId, questionId, optionId });
  }

  function submit() {
    if (!exam) return;
    startTransition(async () => {
      const res = await submitExam({ attemptId: exam.attemptId, answers });
      if (res.ok) {
        setResult(res.result);
        setConfirmSubmit(false);
        setError(null);
      } else setError(res.error);
    });
  }

  if (result) {
    return (
      <div
        role="status"
        data-testid="exam-result"
        className={cn(
          "grid gap-4 rounded-[22px] border-t-[6px] border-b-[6px] bg-card p-6 shadow-panel sm:p-8",
          result.passed
            ? "border-t-brand-sky border-b-brand-green"
            : "border-t-alert-line border-b-alert-line",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "grid size-14 place-items-center rounded-full",
            result.passed
              ? "bg-green-tint text-green-ink"
              : "bg-alert-bg text-alert",
          )}
        >
          {result.passed ? (
            <AwardIcon className="size-7" />
          ) : (
            <CircleAlertIcon className="size-7" />
          )}
        </span>
        <p className="text-[28px] leading-tight font-extrabold tracking-tight">
          {t("score", { score: result.score, total: result.total })}
        </p>
        <p className="text-lg">{result.passed ? t("passed") : t("failed")}</p>
        {!result.passed ? (
          <p className="text-[16px] text-muted-foreground">
            {result.attemptsLeft > 0
              ? t("attemptsLeft", { count: result.attemptsLeft })
              : t("locked")}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-3">
          {result.passed ? (
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
          ) : result.attemptsLeft > 0 ? (
            <Button asChild size="lg">
              <Link href={`/portal/exam/${enrollmentId}`} prefetch={false}>
                {t("startNext", { n: attemptNo + 1 })}
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">{t("contactSupport")}</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <section
        className="grid gap-5 rounded-[22px] border-t-[6px] border-b-[6px] border-t-brand-sky border-b-brand-green bg-card p-6 shadow-panel sm:p-8"
        data-testid="exam-confirm"
      >
        <div>
          <h2 className="text-[26px] leading-tight font-extrabold tracking-tight">
            {t("confirmTitle")}
          </h2>
          <p className="mt-2 text-[17px] text-muted-foreground">
            {t("confirmIntro")}
          </p>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["legalName", details.legalName],
              ["dob", details.dob],
              ["license", details.licenseMasked],
              ["county", details.county],
              ["citation", details.citationNo],
              ["dueDate", details.courtDueDate],
            ] as const
          ).map(([key, value]) => (
            <div
              key={key}
              className="grid gap-0.5 rounded-[16px] bg-hero px-4 py-3"
            >
              <dt className="text-sm font-bold text-muted-foreground">
                {t(`fields.${key}`)}
              </dt>
              <dd className="text-lg font-extrabold break-words">
                {value || "-"}
              </dd>
            </div>
          ))}
        </dl>
        <Button asChild variant="secondary" className="justify-self-start">
          <Link
            href={`/portal/details/${enrollmentId}?next=${encodeURIComponent(`/portal/exam/${enrollmentId}`)}`}
          >
            <PencilIcon aria-hidden />
            {t("editDetails")}
          </Link>
        </Button>
        <label className="lms-choice">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            data-testid="exam-confirm-check"
          />
          <span className="font-semibold">{t("confirmCheckbox")}</span>
        </label>
        {error ? (
          <Notice role="alert" tone="error">
            {t(`errors.${error}`)}
          </Notice>
        ) : null}
        <Button
          size="lg"
          className="justify-self-start"
          onClick={begin}
          disabled={!confirmed || busy}
          data-testid="exam-start"
        >
          {t("start")}
        </Button>
      </section>
    );
  }

  const q = exam.questions[index];
  const missing = unansweredCount(exam.questions, answers);
  const lowTime = remaining !== null && remaining < 5 * 60 * 1000;

  return (
    <div className="grid gap-6" data-testid="exam-runner">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line-blue bg-surface px-4 py-3">
        <Badge tone="neutral" className="bg-card text-[14px]">
          {t("attempt", { n: exam.attemptNo })}
        </Badge>
        {remaining !== null ? (
          <p
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-full px-4 font-mono text-[17px] font-bold tabular-nums",
              lowTime ? "bg-alert-bg text-alert" : "bg-card text-foreground",
            )}
            aria-label={t("timeLeft")}
          >
            <TimerIcon
              aria-hidden
              className={cn("size-[18px]", !lowTime && "text-blue-text")}
            />
            {formatRemaining(remaining)}
          </p>
        ) : null}
      </div>

      <nav
        aria-label={t("navigator")}
        className="flex flex-wrap gap-2 rounded-[22px] border border-line-blue bg-card p-3"
      >
        {exam.questions.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-current={i === index ? "step" : undefined}
            className={cn(
              "grid size-10 place-items-center rounded-full border-2 text-[14px] font-bold transition-colors",
              answers[item.id]
                ? "border-primary bg-blue-tint text-foreground"
                : "border-line-blue bg-card text-muted-foreground hover:border-primary",
              i === index &&
                "border-foreground bg-foreground text-background hover:border-foreground",
            )}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <fieldset className="rounded-[22px] border-t-[6px] border-b-[6px] border-t-brand-sky border-b-brand-green bg-card p-5 shadow-panel sm:p-7">
        <legend className="float-left mb-5 w-full text-[22px] leading-snug font-extrabold tracking-tight text-balance">
          {index + 1}. {q.text}
        </legend>
        <div className="clear-left grid gap-2.5">
          {q.options.map((o) => (
            <label key={o.id} className="lms-choice">
              <input
                type="radio"
                name={q.id}
                value={o.id}
                checked={answers[q.id] === o.id}
                onChange={() => choose(q.id, o.id)}
              />
              <span>{o.text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <Notice role="alert" tone="error">
          {t(`errors.${error}`)}
        </Notice>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          {t("previous")}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={index === exam.questions.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          {t("next")}
        </Button>
        <Button
          type="button"
          size="lg"
          className="sm:ml-auto"
          onClick={() => setConfirmSubmit(true)}
          data-testid="exam-submit"
        >
          {t("submit")}
        </Button>
      </div>

      {confirmSubmit ? (
        <div
          role="alertdialog"
          aria-label={t("submitTitle")}
          className="grid gap-3 rounded-[22px] border-2 border-primary bg-blue-tint p-5 sm:p-6"
        >
          <p className="text-xl font-extrabold tracking-tight">
            {t("submitTitle")}
          </p>
          <p className="text-[17px]">
            {missing > 0 ? t("unanswered", { count: missing }) : t("allDone")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={submit} disabled={busy}>
              {t("submitConfirm")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-card"
              onClick={() => setConfirmSubmit(false)}
            >
              {t("keepWorking")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
