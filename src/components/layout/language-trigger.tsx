"use client";

import { GlobeIcon } from "lucide-react";
import { useLocale } from "next-intl";
import type { ComponentProps } from "react";
import { languages } from "@/i18n/languages";

/** The header's language button. `label` is formatted on the server, so the browser needs no message formatting to show it. Shared by the server-rendered shell and the lazy popover. */
export function LanguageTrigger({
  label,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  const active = languages[useLocale()];

  return (
    <button
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/80 px-2.5 text-sm font-bold hover:bg-white dark:bg-white/10 dark:hover:bg-white/15"
      {...props}
    >
      <GlobeIcon aria-hidden className="size-4" />
      {/* Visible code first, so the accessible name starts with what is shown (WCAG 2.5.3). */}
      {active.shortCode}
      <span className="sr-only">, {label}</span>
    </button>
  );
}
