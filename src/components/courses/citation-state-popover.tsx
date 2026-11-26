"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useId } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CitationStateChip } from "./citation-state-chip";
import type { StateOption } from "./citation-state-selector";

// The waitlist form (react-hook-form and zod) loads only when a coming-soon state is picked.
const StateWaitlistForm = dynamic(
  () => import("./state-waitlist-form").then((m) => m.StateWaitlistForm),
  { ssr: false },
);

/** The state list popover (Radix popper), loaded on the first click on the chip. */
export function CitationStatePopover({
  states,
  code,
  chip,
  className,
  onChoose,
}: {
  states: StateOption[];
  code: string;
  chip: string;
  className?: string;
  onChoose: (code: string) => void;
}) {
  const t = useTranslations("CitationState");
  const selectId = useId();
  const selected =
    states.find((state) => state.code === code) ??
    states.find((state) => state.active);

  return (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <CitationStateChip label={chip} className={className} />
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-80 gap-3">
        <Label htmlFor={selectId}>{t("label")}</Label>
        <select
          id={selectId}
          value={selected?.code ?? code}
          onChange={(event) => onChoose(event.target.value)}
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-base md:text-sm dark:bg-input/30"
        >
          {states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.active
                ? state.name
                : t("optionSoon", { state: state.name })}
            </option>
          ))}
        </select>
        {selected && !selected.active ? (
          <div className="grid gap-2">
            <p className="font-semibold">{t("comingSoon")}</p>
            <p className="text-sm text-muted-foreground">
              {t("comingSoonText", { state: selected.name })}
            </p>
            <StateWaitlistForm
              key={selected.code}
              stateCode={selected.code}
              stateName={selected.name}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("served")}</p>
        )}
      </PopoverContent>
    </Popover>
  );
}
