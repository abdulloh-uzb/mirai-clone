"use client";

import { ArrowUpIcon, MinusIcon, PlayIcon, SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

const STORAGE_KEY = "help-widget-collapsed";

/** Tell the AI assistant panel (ticket 12) to open. */
function openAssistant() {
  window.dispatchEvent(new Event("open-ai-assistant"));
}

/**
 * Floating help shell at the bottom right: a tour card with an "Ask AI
 * anything…" input, collapsible to a small pill. Hidden during the exam.
 */
export function HelpWidget() {
  const t = useTranslations("HelpWidget");
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
        {t("collapsedLabel")}
      </button>
    );
  }

  return (
    <aside
      aria-label={t("region")}
      className="fixed right-4 bottom-4 z-30 w-[250px] rounded-[22px] border border-soft-border bg-card p-3 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-brand-green-ink">
          {t("tourLabel")}
        </p>
        <button
          type="button"
          aria-label={t("minimize")}
          onClick={() => setAndRemember(true)}
          className="grid size-6 place-items-center rounded-full hover:bg-accent"
        >
          <MinusIcon aria-hidden className="size-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={openAssistant}
        className="relative mt-2 block aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-surface-sky to-surface-mint text-left"
      >
        <span
          aria-hidden
          className="absolute inset-0 m-auto grid size-11 place-items-center rounded-full bg-primary text-primary-foreground shadow-md"
        >
          <PlayIcon className="size-5 fill-current" />
        </span>
        <span className="absolute bottom-1.5 left-2 text-sm font-extrabold text-brand-navy">
          {t("tourTitle")}
        </span>
        <span className="sr-only">{t("tourCta")}</span>
      </button>
      <form
        className="relative mt-3"
        onSubmit={(event) => {
          event.preventDefault();
          openAssistant();
        }}
      >
        <input
          type="text"
          aria-label={t("placeholder")}
          placeholder={t("placeholder")}
          onFocus={openAssistant}
          className="h-11 w-full rounded-full border-2 border-soft-border bg-background pr-11 pl-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          aria-label={t("send")}
          className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <ArrowUpIcon aria-hidden className="size-4" />
        </button>
      </form>
    </aside>
  );
}
