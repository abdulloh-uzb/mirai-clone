"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Link } from "@/i18n/navigation";
import {
  allAnswered,
  type QuizErrorKey,
  type QuizPayload,
  type QuizResult,
} from "@/lib/course/quiz";
import { startQuiz, submitQuiz } from "@/lib/portal/quiz-actions";
import { cn } from "@/lib/utils";

/**
 * One page of fieldsets with radio groups. Grading happens in the database;
 * the browser only learns which answers were right after submitting.
 */
export function QuizRunner({
  enrollmentId,
  section,
  isLastSection,
  initial,
}: {
  enrollmentId: string;
  section: number;
  isLastSection: boolean;
  initial: QuizPayload;
}) {
  const t = useTranslations("Quiz");
  const [quiz, setQuiz] = useState(initial);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<QuizErrorKey | null>(null);
  const [busy, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!allAnswered(quiz.questions, answers)) return;
    startTransition(async () => {
      const res = await submitQuiz({ attemptId: quiz.attemptId, answers });
      if (res.ok) {
        setResult(res.result);
        setError(null);
      } else setError(res.error);
    });
  }

  function onRetry() {
    startTransition(async () => {
      const res = await startQuiz({ enrollmentId, section });
      if (res.ok) {
        setQuiz(res.quiz);
        setAnswers({});
        setResult(null);
        setError(null);
      } else setError(res.error);
    });
  }

  const byQuestion = new Map(result?.results.map((r) => [r.questionId, r]));

  return (
    <form onSubmit={onSubmit} className="grid gap-6" data-testid="quiz-form">
      {result ? (
        <Notice role="status" tone={result.passed ? "success" : "error"}>
          <p className="text-xl font-extrabold tracking-tight">
            {t("score", { score: result.score, total: result.total })}
          </p>
          <p className="mt-1">{result.passed ? t("passed") : t("failed")}</p>
        </Notice>
      ) : null}

      {quiz.questions.map((q, index) => {
        const graded = byQuestion.get(q.id);
        return (
          <fieldset
            key={q.id}
            className="rounded-[22px] border border-line-blue bg-card p-5 sm:p-6"
            disabled={!!result}
          >
            <legend className="float-left mb-4 w-full text-xl leading-snug font-extrabold tracking-tight text-balance">
              {index + 1}. {q.text}
            </legend>
            <div className="clear-left grid gap-2.5">
              {q.options.map((o) => {
                const chosen = answers[q.id] === o.id;
                const isRight = graded?.correctOptionId === o.id;
                return (
                  <label
                    key={o.id}
                    className="lms-choice"
                    data-tone={
                      graded && isRight
                        ? "right"
                        : graded && chosen
                          ? "wrong"
                          : undefined
                    }
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={o.id}
                      checked={chosen}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: o.id }))
                      }
                    />
                    <span>{o.text}</span>
                  </label>
                );
              })}
            </div>
            {graded ? (
              <div
                className={cn(
                  "mt-4 rounded-[16px] px-4 py-3 text-[16px]",
                  graded.correct ? "bg-green-tint" : "bg-alert-bg",
                )}
                role="note"
              >
                <p
                  className={cn(
                    "font-extrabold",
                    graded.correct ? "text-green-ink" : "text-alert",
                  )}
                >
                  {graded.correct ? t("correct") : t("incorrect")}
                </p>
                {graded.explanation ? (
                  <p className="mt-1">{graded.explanation}</p>
                ) : null}
              </div>
            ) : null}
          </fieldset>
        );
      })}

      {error ? (
        <Notice role="alert" tone="error">
          {t(`errors.${error}`)}
        </Notice>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {!result ? (
          <Button
            type="submit"
            size="lg"
            disabled={busy || !allAnswered(quiz.questions, answers)}
            data-testid="quiz-submit"
          >
            {t("submit")}
          </Button>
        ) : result.passed ? (
          isLastSection ? (
            <Button asChild size="lg">
              <Link href={`/portal/exam/${enrollmentId}`}>{t("toExam")}</Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href={`/portal/course/${enrollmentId}/${section + 1}`}>
                {t("continue", { section: section + 1 })}
              </Link>
            </Button>
          )
        ) : (
          <Button type="button" size="lg" onClick={onRetry} disabled={busy}>
            {t("retry")}
          </Button>
        )}
        <Button asChild size="lg" variant="outline">
          <Link href={`/portal/course/${enrollmentId}/${section}`}>
            {t("backToSection")}
          </Link>
        </Button>
      </div>
    </form>
  );
}
