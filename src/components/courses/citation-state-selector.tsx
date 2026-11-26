"use client";

import { ChevronDownIcon, MapPinIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TICKET_STATE_COOKIE,
  TICKET_STATE_MAX_AGE,
} from "@/lib/citation-state";
import { cn } from "@/lib/utils";
import { StateWaitlistForm } from "./state-waitlist-form";

export type StateOption = { code: string; name: string; active: boolean };

/**
 * "Where is your ticket from?": a compact chip that opens a state list. The
 * choice is kept in the `ticket_state` cookie for a year. A state the school
 * does not serve yet shows "Coming soon — notify me" with the State waitlist.
 */
export function CitationStateSelector({
  states,
  current,
  className,
}: {
  states: StateOption[];
  current: string;
  className?: string;
}) {
  const t = useTranslations("CitationState");
  const router = useRouter();
  const selectId = useId();
  const [code, setCode] = useState(current);
  const selected =
    states.find((state) => state.code === code) ??
    states.find((state) => state.active);

  function choose(next: string) {
    setCode(next);
    document.cookie = `${TICKET_STATE_COOKIE}=${next}; path=/; max-age=${TICKET_STATE_MAX_AGE}; samesite=lax`;
    router.refresh();
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium shadow-xs hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
          className,
        )}
      >
        <MapPinIcon aria-hidden className="size-4 text-link" />
        {t("chip", { state: selected?.name ?? code })}
        <ChevronDownIcon aria-hidden className="size-4 opacity-60" />
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-80 gap-3">
        <Label htmlFor={selectId}>{t("label")}</Label>
        <select
          id={selectId}
          value={selected?.code ?? code}
          onChange={(event) => choose(event.target.value)}
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
