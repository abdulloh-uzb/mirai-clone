"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
    <fieldset className="rounded-xl border bg-card p-4">
      <legend className="px-1 text-sm font-semibold text-muted-foreground">
        {t("scenario")}
      </legend>
      <p className="font-medium">{prompt}</p>
      <div className="mt-3 space-y-2">
        {choices.map((c, i) => (
          <label
            key={c.text}
            className={cn(
              "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
              picked === i && "border-primary bg-primary/10",
            )}
          >
            <input
              type="radio"
              name={name}
              checked={picked === i}
              onChange={() => setPicked(i)}
              className="mt-1"
            />
            <span>{c.text}</span>
          </label>
        ))}
      </div>
      {choice ? (
        <p role="status" className="mt-3 rounded-lg bg-muted p-3 text-sm">
          <strong>{choice.best ? t("bestChoice") : t("notBest")}</strong>{" "}
          {choice.feedback}
        </p>
      ) : null}
    </fieldset>
  );
}
