"use client";

import { CheckIcon } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

type Courthouse = {
  name: string;
  city: string | null;
  address: string | null;
  courtCode: string | null;
};

export type PlanLabels = {
  stepOf: string;
  which: string;
  whichHelp: string;
  next: string;
  dueQ: string;
  dueHelp: string;
  dueLabel: string;
  back: string;
  planTitle: string;
  courthouse: string;
  courtCode: string;
  noCode: string;
  dueDate: string;
  daysLeft: string;
  late: string;
  askBefore: string;
  stepsHeading: string;
  steps: string[];
  cta: string;
  startOver: string;
  nothingSaved: string;
  strip: string[];
  stripLabel: string;
  current: string;
  waiting: string;
  done: string;
  mapAlt: string;
};

/**
 * The county "ticket plan": pick the courthouse, add the due date, read the
 * plan. It runs in the page only; nothing is saved or sent.
 */
export function CountyPlan({
  courthouses,
  mapSrc,
  labels,
  stepArt,
}: {
  courthouses: Courthouse[];
  mapSrc: string;
  labels: PlanLabels;
  stepArt: [string, string];
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [house, setHouse] = useState<number | null>(
    courthouses.length === 1 ? 0 : null,
  );
  const [due, setDue] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dueId = useId();

  function go(next: 0 | 1 | 2) {
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  const chosen = house === null ? null : courthouses[house];
  const days = due
    ? Math.round(
        (new Date(`${due}T00:00:00`).getTime() -
          new Date(new Date().toDateString()).getTime()) /
          86_400_000,
      )
    : null;

  const status = (i: number) =>
    i === step ? "current" : i < step ? "done" : "waiting";
  const statusText = {
    current: labels.current,
    done: labels.done,
    waiting: labels.waiting,
  };

  return (
    <section aria-labelledby="ctStageH">
      <h2 className="sr" id="ctStageH">
        {labels.planTitle}
      </h2>
      <div className="ct-stage" id="ctStage">
        <div className="ct-art">
          <span className="ct-bigpic">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mapSrc} alt={labels.mapAlt} />
          </span>
        </div>
        <div className="ct-side" aria-live="polite">
          {step === 0 ? (
            <>
              <p className="ct-of">{labels.stepOf.replace("{n}", "1")}</p>
              <h3 id="ctQh" tabIndex={-1} ref={headingRef}>
                {labels.which}
              </h3>
              <p className="ct-help">{labels.whichHelp}</p>
              <div
                className={`ct-list${courthouses.length > 4 ? "is-many" : ""}`}
                role="group"
                aria-labelledby="ctQh"
                style={{ "--rows": courthouses.length } as React.CSSProperties}
              >
                {courthouses.map((item, index) => (
                  <button
                    key={`${item.name}-${item.courtCode}`}
                    type="button"
                    className="ct-row"
                    aria-pressed={house === index}
                    onClick={() => setHouse(index)}
                  >
                    <span className="ct-row-t">
                      <b>{item.name}</b>
                      {item.city ? <span>{item.city}</span> : null}
                    </span>
                    <span className="ct-row-ck" aria-hidden="true">
                      <CheckIcon />
                    </span>
                  </button>
                ))}
              </div>
              <div className="ct-acts">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled={house === null}
                  onClick={() => go(1)}
                >
                  {labels.next}
                </button>
              </div>
            </>
          ) : null}
          {step === 1 ? (
            <>
              <p className="ct-of">{labels.stepOf.replace("{n}", "2")}</p>
              <h3 id="ctQh" tabIndex={-1} ref={headingRef}>
                {labels.dueQ}
              </h3>
              <p className="ct-help">{labels.dueHelp}</p>
              <div className="ct-due">
                <div className="mf">
                  <label htmlFor={dueId}>{labels.dueLabel}</label>
                  <div className="fx">
                    <input
                      id={dueId}
                      type="date"
                      value={due}
                      onChange={(event) => setDue(event.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="ct-acts">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  disabled={due === ""}
                  onClick={() => go(2)}
                >
                  {labels.next}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => go(0)}
                >
                  {labels.back}
                </button>
              </div>
            </>
          ) : null}
          {step === 2 && chosen ? (
            <>
              <h3 id="ctQh" tabIndex={-1} ref={headingRef} className="sr">
                {labels.planTitle}
              </h3>
              <div className="ct-paper">
                <div className="ct-p-top">
                  <p className="ct-p-k">{labels.planTitle}</p>
                </div>
                <dl className="ct-p-rows">
                  <div className="ct-p-row">
                    <dt>{labels.courthouse}</dt>
                    <dd>
                      {chosen.name}
                      {chosen.address ? (
                        <span className="ct-p-a">{chosen.address}</span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="ct-p-row">
                    <dt>{labels.courtCode}</dt>
                    <dd>
                      {chosen.courtCode ? (
                        <span className="ct-p-code">{chosen.courtCode}</span>
                      ) : (
                        labels.noCode
                      )}
                    </dd>
                  </div>
                </dl>
                <hr className="ct-p-cut" />
                <div className="ct-p-due">
                  <span>{labels.dueDate}</span>
                  <div>
                    <b>{due}</b>
                    <em className={days !== null && days < 0 ? "is-late" : ""}>
                      {days !== null && days >= 0
                        ? labels.daysLeft.replace("{count}", String(days))
                        : labels.late}
                    </em>
                  </div>
                </div>
                <p className="ct-p-late">{labels.askBefore}</p>
                <ol className="ct-p-list" aria-label={labels.stepsHeading}>
                  {labels.steps.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ol>
              </div>
              <div className="ct-acts ct-acts-col">
                <Link className="btn btn-primary btn-lg" href="/courses">
                  {labels.cta}
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => go(1)}
                >
                  {labels.back}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setDue("");
                    setHouse(courthouses.length === 1 ? 0 : null);
                    go(0);
                  }}
                >
                  {labels.startOver}
                </button>
              </div>
              <p className="ct-help">{labels.nothingSaved}</p>
            </>
          ) : null}
        </div>
      </div>
      <ol className="ct-strip" aria-label={labels.stripLabel}>
        {labels.strip.map((label, index) => {
          const s = status(index);
          return (
            <li key={label}>
              <div
                className="ct-th"
                data-s={s}
                aria-current={s === "current" ? "step" : undefined}
              >
                <span className="ct-th-w">
                  <span className="ct-th-pic">
                    {index === 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mapSrc} alt="" />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="pic-day"
                          src={`/reference/art/${stepArt[index - 1]}.webp`}
                          alt=""
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="pic-night"
                          src={`/reference/art/${stepArt[index - 1]}-night.webp`}
                          alt=""
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </span>
                </span>
                <span className="ct-th-lab">
                  {label}
                  <span className="sr"> ({statusText[s]})</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
