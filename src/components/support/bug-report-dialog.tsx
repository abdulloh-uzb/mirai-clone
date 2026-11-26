"use client";

import { lazy, Suspense, useState, type ReactNode } from "react";

// The dialog (Radix dialog, focus lock, form) loads on the first click, not with the page.
const BugReportDialogImpl = lazy(() =>
  import("./bug-report-dialog-impl").then((m) => ({
    default: m.BugReportDialogImpl,
  })),
);

/**
 * The "Got a problem?" dialog. `trigger` is the button or link that opens it.
 * `accountEmail` comes from the server for a signed-in Student; the server
 * action ignores any email the browser sends in that case.
 */
export function BugReportDialog({
  trigger,
  accountEmail,
}: {
  trigger: ReactNode;
  accountEmail?: string;
}) {
  const [requested, setRequested] = useState(false);

  if (!requested) {
    // A click on the trigger button bubbles up to this wrapper (no layout box).
    return (
      <span className="contents" onClick={() => setRequested(true)}>
        {trigger}
      </span>
    );
  }
  return (
    <Suspense fallback={trigger}>
      <BugReportDialogImpl trigger={trigger} accountEmail={accountEmail} />
    </Suspense>
  );
}
