"use client";

import { lazy, Suspense, useState } from "react";
import { LanguageTrigger } from "./language-trigger";

// The popover (Radix popper) loads on the first click, not with the page.
const LanguageSwitcherPopover = lazy(() =>
  import("./language-switcher-popover").then((m) => ({
    default: m.LanguageSwitcherPopover,
  })),
);

export function LanguageSwitcher({ label }: { label: string }) {
  const [requested, setRequested] = useState(false);
  return requested ? (
    <Suspense fallback={<LanguageTrigger label={label} />}>
      <LanguageSwitcherPopover label={label} />
    </Suspense>
  ) : (
    <LanguageTrigger label={label} onClick={() => setRequested(true)} />
  );
}
