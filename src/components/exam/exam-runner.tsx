"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
          "space-y-4 rounded-xl border p-6",
          result.passed
            ? "border-brand-green/50 bg-brand-green/10"
            : "border-destructive/50 bg-destructive/10",
        )}
      >
        <p className="text-xl font-semibold">
          {t("score", { score: result.score, total: result.total })}
        </p>
        <p>{result.passed ? t("passed") : t("failed")}</p>
        {!result.passed ? (
          <p className="text-sm">
            {result.attemptsLeft > 0
              ? t("attemptsLeft", { count: result.attemptsLeft })
              : t("locked")}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          {result.passed ? (
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
          ) : result.attemptsLeft > 0 ? (
            <Button asChild>
              <Link href={`/portal/exam/${enrollmentId}`} prefetch={false}>
                {t("startNext", { n: attemptNo + 1 })}
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/contact">{t("contactSupport")}</Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <section className="space-y-4" data-testid="exam-confirm">
        <h2 className="text-xl font-semibold">{t("confirmTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("confirmIntro")}</p>
        <dl className="grid gap-2 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
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
            <div key={key}>
              <dt className="text-muted-foreground">{t(`fields.${key}`)}</dt>
              <dd className="font-medium">{value || "-"}</dd>
            </div>
          ))}
        </dl>
        <Button asChild variant="outline">
          <Link
            href={`/portal/details/${enrollmentId}?next=${encodeURIComponent(`/portal/exam/${enrollmentId}`)}`}
          >
            {t("editDetails")}
          </Link>
        </Button>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1"
            data-testid="exam-confirm-check"
          />
          <span>{t("confirmCheckbox")}</span>
        </label>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {t(`errors.${error}`)}
          </p>
        ) : null}
        <Button
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

  return (
    <div className="space-y-6" data-testid="exam-runner">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("attempt", { n: exam.attemptNo })}
        </p>
        {remaining !== null ? (
          <p
            className="font-mono text-sm font-semibold"
            aria-label={t("timeLeft")}
          >
            {formatRemaining(remaining)}
          </p>
        ) : null}
      </div>

      <nav aria-label={t("navigator")} className="flex flex-wrap gap-1.5">
        {exam.questions.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-current={i === index ? "step" : undefined}
            className={cn(
              "size-8 rounded-md border text-xs",
              answers[item.id] && "bg-primary/10",
              i === index && "border-primary font-bold",
            )}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <fieldset className="space-y-3 rounded-xl border bg-card p-4">
        <legend className="px-1 font-semibold">
          {index + 1}. {q.text}
        </legend>
        {q.options.map((o) => (
          <label
            key={o.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm",
              answers[q.id] === o.id && "border-primary",
            )}
          >
            <input
              type="radio"
              name={q.id}
              value={o.id}
              checked={answers[q.id] === o.id}
              onChange={() => choose(q.id, o.id)}
              className="mt-1"
            />
            <span>{o.text}</span>
          </label>
        ))}
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          {t("previous")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={index === exam.questions.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          {t("next")}
        </Button>
        <Button
          type="button"
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
          className="space-y-3 rounded-xl border-2 border-primary bg-card p-4"
        >
          <p className="font-semibold">{t("submitTitle")}</p>
          <p className="text-sm">
            {missing > 0 ? t("unanswered", { count: missing }) : t("allDone")}
          </p>
          <div className="flex gap-3">
            <Button onClick={submit} disabled={busy}>
              {t("submitConfirm")}
            </Button>
            <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
              {t("keepWorking")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
