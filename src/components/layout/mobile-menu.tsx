"use client";

import { lazy, Suspense, useState } from "react";
import { MobileMenuTrigger } from "./mobile-menu-trigger";

// The sheet (Radix dialog) loads on the first tap, not with the page.
const MobileMenuSheet = lazy(() =>
  import("./mobile-menu-sheet").then((m) => ({ default: m.MobileMenuSheet })),
);

export function MobileMenu({ label }: { label: string }) {
  const [requested, setRequested] = useState(false);
  return requested ? (
    <Suspense fallback={<MobileMenuTrigger label={label} />}>
      <MobileMenuSheet label={label} />
    </Suspense>
  ) : (
    <MobileMenuTrigger label={label} onClick={() => setRequested(true)} />
  );
}
