"use client";

import { SparklesIcon } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

const STORAGE_KEY = "help-widget-collapsed";

// The expanded card (and its message formatting) loads only when it is shown.
const HelpWidgetCard = lazy(() =>
  import("./help-widget-card").then((m) => ({ default: m.HelpWidgetCard })),
);

/**
 * Floating help shell at the bottom right: a tour card with an "Ask AI
 * anything…" input, collapsible to a small pill. Hidden during the exam.
 * `collapsedLabel` is translated on the server.
 */
export function HelpWidget({ collapsedLabel }: { collapsedLabel: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage can be blocked; fall back to the default.
    }
    // Expanded only for first-time visitors on a wide screen.
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only state read after mount
    setCollapsed(stored === null ? !wide : stored === "1");
    setReady(true);
  }, []);

  if (pathname.startsWith("/portal/exam") || !ready) return null;

  function setAndRemember(value: boolean) {
    setCollapsed(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // Ignore blocked storage.
    }
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setAndRemember(false)}
        className="fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full border border-soft-border bg-card py-1.5 pr-4 pl-1.5 text-sm font-bold shadow-lg hover:bg-accent"
      >
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <SparklesIcon className="size-4" />
        </span>
        {collapsedLabel}
      </button>
    );
  }

  return (
    <Suspense fallback={null}>
      <HelpWidgetCard onMinimize={() => setAndRemember(true)} />
    </Suspense>
  );
}
