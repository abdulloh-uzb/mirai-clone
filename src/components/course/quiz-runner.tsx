"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
    <form onSubmit={onSubmit} className="space-y-6" data-testid="quiz-form">
      {result ? (
        <div
          role="status"
          className={cn(
            "rounded-xl border p-4",
            result.passed
              ? "border-brand-green/50 bg-brand-green/10"
              : "border-destructive/50 bg-destructive/10",
          )}
        >
          <p className="font-semibold">
            {t("score", { score: result.score, total: result.total })}
          </p>
          <p className="text-sm">{result.passed ? t("passed") : t("failed")}</p>
        </div>
      ) : null}

      {quiz.questions.map((q, index) => {
        const graded = byQuestion.get(q.id);
        return (
          <fieldset
            key={q.id}
            className="space-y-3 rounded-xl border bg-card p-4"
            disabled={!!result}
          >
            <legend className="px-1 font-semibold">
              {index + 1}. {q.text}
            </legend>
            {q.options.map((o) => {
              const chosen = answers[q.id] === o.id;
              const isRight = graded?.correctOptionId === o.id;
              return (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 text-sm",
                    chosen && !graded && "border-primary",
                    graded && isRight && "border-brand-green bg-brand-green/10",
                    graded &&
                      chosen &&
                      !isRight &&
                      "border-destructive bg-destructive/10",
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={o.id}
                    checked={chosen}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: o.id }))
                    }
                    className="mt-1"
                  />
                  <span>{o.text}</span>
                </label>
              );
            })}
            {graded ? (
              <div className="text-sm" role="note">
                <p className="font-semibold">
                  {graded.correct ? t("correct") : t("incorrect")}
                </p>
                {graded.explanation ? <p>{graded.explanation}</p> : null}
              </div>
            ) : null}
          </fieldset>
        );
      })}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {!result ? (
          <Button
            type="submit"
            disabled={busy || !allAnswered(quiz.questions, answers)}
            data-testid="quiz-submit"
          >
            {t("submit")}
          </Button>
        ) : result.passed ? (
          isLastSection ? (
            <Button asChild>
              <Link href={`/portal/exam/${enrollmentId}`}>{t("toExam")}</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`/portal/course/${enrollmentId}/${section + 1}`}>
                {t("continue", { section: section + 1 })}
              </Link>
            </Button>
          )
        ) : (
          <Button type="button" onClick={onRetry} disabled={busy}>
            {t("retry")}
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href={`/portal/course/${enrollmentId}/${section}`}>
            {t("backToSection")}
          </Link>
        </Button>
      </div>
    </form>
  );
}
