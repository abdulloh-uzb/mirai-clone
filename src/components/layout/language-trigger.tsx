"use client";

import { ChevronDownIcon } from "lucide-react";
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
    <button type="button" className="lpill lang-btn" {...props}>
      <span className="lglyph lflag" aria-hidden="true">
        {active.flag}
      </span>
      {/* Visible code first, so the accessible name starts with what is shown (WCAG 2.5.3). */}
      <span className="lc">{active.shortCode}</span>
      <ChevronDownIcon aria-hidden className="lchev" />
      <span className="sr-only">, {label}</span>
    </button>
  );
}
