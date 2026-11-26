"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Notice } from "@/components/ui/notice";

type Choice = { text: string; feedback: string; best: boolean };

/** Practice only: the choices and feedback are not graded or stored. */
export function ScenarioBlock({
  prompt,
  choices,
}: {
  prompt: string;
  choices: Choice[];
}) {
  const t = useTranslations("Player");
  const name = useId();
  const [picked, setPicked] = useState<number | null>(null);
  const choice = picked === null ? null : choices[picked];
  return (
    <fieldset className="rounded-[22px] border border-line-blue bg-surface p-5 sm:p-6">
      <legend className="float-left mb-3 inline-flex rounded-full bg-card px-3 py-1 text-[13px] font-extrabold tracking-[0.06em] text-blue-text uppercase">
        {t("scenario")}
      </legend>
      <p className="clear-left text-xl leading-snug font-extrabold tracking-tight text-balance">
        {prompt}
      </p>
      <div className="mt-4 grid gap-2.5">
        {choices.map((c, i) => (
          <label key={c.text} className="lms-choice">
            <input
              type="radio"
              name={name}
              checked={picked === i}
              onChange={() => setPicked(i)}
            />
            <span>{c.text}</span>
          </label>
        ))}
      </div>
      {choice ? (
        <Notice
          role="status"
          tone={choice.best ? "success" : "warning"}
          className="mt-4"
        >
          <strong>{choice.best ? t("bestChoice") : t("notBest")}</strong>{" "}
          {choice.feedback}
        </Notice>
      ) : null}
    </fieldset>
  );
}
