"use client";

import { ArrowUpIcon, MinusIcon, PlayIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/** Tell the AI assistant panel (ticket 12) to open. */
function openAssistant() {
  window.dispatchEvent(new Event("open-ai-assistant"));
}

/** The expanded help card. Loaded only when it is shown, so message formatting stays out of the first load. */
export function HelpWidgetCard({ onMinimize }: { onMinimize: () => void }) {
  const t = useTranslations("HelpWidget");

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
          onClick={onMinimize}
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
