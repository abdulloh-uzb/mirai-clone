"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { lazy, Suspense, useState } from "react";
import {
  TICKET_STATE_COOKIE,
  TICKET_STATE_MAX_AGE,
} from "@/lib/citation-state";
import { CitationStateChip } from "./citation-state-chip";

export type StateOption = { code: string; name: string; active: boolean };

// The state list (Radix popper) loads on the first click, not with the page.
const CitationStatePopover = lazy(() =>
  import("./citation-state-popover").then((m) => ({
    default: m.CitationStatePopover,
  })),
);

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
  const [code, setCode] = useState(current);
  const [requested, setRequested] = useState(false);
  const selected =
    states.find((state) => state.code === code) ??
    states.find((state) => state.active);
  const chip = t("chip", { state: selected?.name ?? code });

  function choose(next: string) {
    setCode(next);
    document.cookie = `${TICKET_STATE_COOKIE}=${next}; path=/; max-age=${TICKET_STATE_MAX_AGE}; samesite=lax`;
    router.refresh();
  }

  const button = (
    <CitationStateChip
      label={chip}
      className={className}
      onClick={() => setRequested(true)}
    />
  );
  if (!requested) return button;
  return (
    <Suspense fallback={button}>
      <CitationStatePopover
        states={states}
        code={code}
        chip={chip}
        className={className}
        onChoose={choose}
      />
    </Suspense>
  );
}
