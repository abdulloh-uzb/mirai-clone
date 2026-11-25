"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  ELIGIBILITY_QUESTIONS,
  eligibilityResult,
  type EligibilityAnswers,
  type EligibilityResult,
} from "@/config/states/ca";

/** Five yes/no questions; the result is computed in the browser and never stored. */
export function EligibilityCheck() {
  const t = useTranslations("Eligibility");
  const [answers, setAnswers] = useState<Partial<EligibilityAnswers>>({});
  const [result, setResult] = useState<EligibilityResult | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(eligibilityResult(answers));
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      {ELIGIBILITY_QUESTIONS.map((question, index) => (
        <fieldset key={question} className="rounded-xl border bg-card p-4">
          <legend className="px-1 font-semibold">
            {index + 1}. {t(`questions.${question}`)}
          </legend>
          <div className="mt-2 flex gap-6">
            {(["yes", "no"] as const).map((answer) => (
              <label key={answer} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={question}
                  value={answer}
                  checked={answers[question] === (answer === "yes")}
                  onChange={() => {
                    setAnswers((prev) => ({
                      ...prev,
                      [question]: answer === "yes",
                    }));
                    setResult(null);
                  }}
                  className="size-4 accent-primary"
                />
                {t(answer)}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <Button type="submit" size="lg" className="justify-self-start">
        {t("check")}
      </Button>
      <div role="status" aria-live="polite">
        {result ? <ResultPanel result={result} /> : null}
      </div>
    </form>
  );
}

function ResultPanel({ result }: { result: EligibilityResult }) {
  const t = useTranslations("Eligibility");
  if (result.status === "incomplete") {
    return <p className="text-destructive">{t("incomplete")}</p>;
  }
  if (result.status === "eligible") {
    return (
      <div className="rounded-xl border border-emerald-600/40 bg-emerald-600/10 p-5">
        <p className="text-xl font-bold">{t("eligibleTitle")}</p>
        <p className="mt-2">{t("eligibleText")}</p>
        <Link href="/courses" className={buttonVariants({ className: "mt-4" })}>
          {t("eligibleCta")}
        </Link>
      </div>
    );
  }
  const askCourt = result.status === "askCourt";
  return (
    <div className="rounded-xl border border-amber-600/40 bg-amber-500/10 p-5">
      <p className="text-xl font-bold">
        {askCourt ? t("askCourtTitle") : t("notEligibleTitle")}
      </p>
      <p className="mt-2">
        {t("blockedBy", {
          question: t(`questions.${result.blockingQuestion}`),
        })}
      </p>
      <p className="mt-2">{t(`nextStep.${result.blockingQuestion}`)}</p>
      {askCourt ? (
        <Link
          href="/courts"
          className={buttonVariants({ variant: "outline", className: "mt-4" })}
        >
          {t("findCourt")}
        </Link>
      ) : null}
    </div>
  );
}
