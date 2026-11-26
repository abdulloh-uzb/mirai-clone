"use client";

import { ChevronDownIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  ELIGIBILITY_QUESTIONS,
  eligibilityResult,
  type EligibilityAnswers,
  type EligibilityQuestionId,
  type EligibilityResult,
} from "@/config/states/ca";

/** Picture beside each question (files in public/reference/art). */
const ART: Record<EligibilityQuestionId, string> = {
  validLicense: "elig-licence",
  courtAllowed: "elig-court",
  noRecentSchool: "elig-18months",
  nonCommercial: "dmv-car",
  eligibleViolation: "elig-moving",
};

type Labels = {
  questionOf: string;
  why: string;
  back: string;
  startOver: string;
  thumbsLabel: string;
  current: string;
  todo: string;
  done: string;
  thumbs: Record<EligibilityQuestionId, string>;
};

function Pic({ name, priority }: { name: string; priority?: boolean }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="pic-day"
        src={`/reference/art/${name}.webp`}
        alt=""
        fetchPriority={priority ? "high" : undefined}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="pic-night"
        src={`/reference/art/${name}-night.webp`}
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
    </>
  );
}

/**
 * The eligibility check: one yes/no question at a time with a picture, then
 * the result. Computed in the browser and never stored.
 */
export function EligibilityCheck({ labels }: { labels: Labels }) {
  const t = useTranslations("Eligibility");
  const [answers, setAnswers] = useState<Partial<EligibilityAnswers>>({});
  const [index, setIndex] = useState(0);
  const [showWhy, setShowWhy] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const whyId = useId();

  const total = ELIGIBILITY_QUESTIONS.length;
  const finished = index >= total;
  const result = finished ? eligibilityResult(answers) : null;
  const question = ELIGIBILITY_QUESTIONS[Math.min(index, total - 1)];

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function answer(value: boolean) {
    setAnswers((prev) => ({ ...prev, [question]: value }));
    setShowWhy(false);
    setIndex((prev) => prev + 1);
    focusHeading();
  }

  function back() {
    setShowWhy(false);
    setIndex((prev) => Math.max(0, prev - 1));
    focusHeading();
  }

  function restart() {
    setAnswers({});
    setShowWhy(false);
    setIndex(0);
    focusHeading();
  }

  const status = (i: number) =>
    i === index ? "current" : i < index ? "done" : "todo";
  const statusText = {
    current: labels.current,
    done: labels.done,
    todo: labels.todo,
  };

  return (
    <>
      <div aria-live="polite">
        <div className="v2-stage">
          <div className="v2-stage-art">
            {ELIGIBILITY_QUESTIONS.map((q, i) => (
              <span
                key={q}
                className={`v2-stage-pic${i === Math.min(index, total - 1) ? "on" : ""}`}
                aria-hidden={
                  i === Math.min(index, total - 1) ? undefined : true
                }
              >
                <Pic name={ART[q]} priority={i === 0} />
              </span>
            ))}
          </div>
          <div className="v2-stage-side">
            {result ? (
              <>
                <h2 id="elig-result-h" tabIndex={-1} ref={headingRef}>
                  {result.status === "eligible"
                    ? t("eligibleTitle")
                    : result.status === "askCourt"
                      ? t("askCourtTitle")
                      : result.status === "notEligible"
                        ? t("notEligibleTitle")
                        : t("incomplete")}
                </h2>
                <div role="status" aria-live="polite">
                  <ResultPanel result={result} />
                </div>
                <div className="el-nav">
                  <button type="button" className="el-link" onClick={back}>
                    {labels.back}
                  </button>
                  <button type="button" className="el-link" onClick={restart}>
                    {labels.startOver}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="v2-stage-of">
                  {labels.questionOf
                    .replace("{n}", String(index + 1))
                    .replace("{total}", String(total))}
                </p>
                <h2 id={`${whyId}-q`} tabIndex={-1} ref={headingRef}>
                  {t(`questions.${question}`)}
                </h2>
                <div
                  className="v2-answers"
                  role="group"
                  aria-labelledby={`${whyId}-q`}
                >
                  {(["yes", "no"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`v2-answer v2-answer-${value}`}
                      aria-pressed={answers[question] === (value === "yes")}
                      onClick={() => answer(value === "yes")}
                    >
                      {t(value)}
                    </button>
                  ))}
                </div>
                <div className="el-nav">
                  <button
                    type="button"
                    className="el-link"
                    aria-expanded={showWhy}
                    aria-controls={whyId}
                    onClick={() => setShowWhy((prev) => !prev)}
                  >
                    {labels.why}
                    <ChevronDownIcon aria-hidden />
                  </button>
                  {index > 0 ? (
                    <button type="button" className="el-link" onClick={back}>
                      {labels.back}
                    </button>
                  ) : null}
                </div>
                <div className="el-why-panel" id={whyId} hidden={!showWhy}>
                  <p>{t(`nextStep.${question}`)}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ol className="v2-thumbs" aria-label={labels.thumbsLabel}>
        {ELIGIBILITY_QUESTIONS.map((q, i) => {
          const s = status(i);
          return (
            <li key={q}>
              <div
                className="v2-thumb"
                data-s={s}
                aria-current={s === "current" ? "step" : undefined}
              >
                <span className="v2-thumb-pic" aria-hidden="true">
                  <Pic name={ART[q]} />
                </span>
                <span className="v2-thumb-lab">
                  {labels.thumbs[q]}
                  <span className="sr-only"> ({statusText[s]})</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function ResultPanel({ result }: { result: EligibilityResult }) {
  const t = useTranslations("Eligibility");
  if (result.status === "incomplete") {
    return <p>{t("incomplete")}</p>;
  }
  if (result.status === "eligible") {
    return (
      <>
        <p className="v2-stage-help">{t("eligibleText")}</p>
        <div className="el-acts">
          <Link className="btn btn-primary btn-lg" href="/courses">
            {t("eligibleCta")}
          </Link>
        </div>
      </>
    );
  }
  const askCourt = result.status === "askCourt";
  return (
    <>
      <p className="v2-stage-help">
        {t("blockedBy", {
          question: t(`questions.${result.blockingQuestion}`),
        })}
      </p>
      <p className="v2-stage-help">
        {t(`nextStep.${result.blockingQuestion}`)}
      </p>
      {askCourt ? (
        <div className="el-acts">
          <Link className="btn btn-secondary btn-lg" href="/courts">
            {t("findCourt")}
          </Link>
        </div>
      ) : null}
    </>
  );
}
