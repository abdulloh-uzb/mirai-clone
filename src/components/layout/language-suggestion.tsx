"use client";

import { GlobeIcon, XIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { languages } from "@/i18n/languages";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import {
  LANGUAGE_BANNER_DISMISSED_COOKIE,
  suggestLanguage,
} from "@/i18n/suggest-language";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function isDismissed(): boolean {
  return document.cookie
    .split("; ")
    .some((pair) => pair.startsWith(`${LANGUAGE_BANNER_DISMISSED_COOKIE}=`));
}

function rememberDismissed() {
  document.cookie = `${LANGUAGE_BANNER_DISMISSED_COOKIE}=1; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

/**
 * Offers the current page in the browser's preferred language. Decided in the
 * browser (so cached pages stay shareable) and never redirects: an explicit
 * URL always wins (spec section 12).
 */
export function LanguageSuggestion() {
  const t = useTranslations("LanguageSuggestion");
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const [suggested, setSuggested] = useState<Locale | null>(null);

  useEffect(() => {
    if (isDismissed()) return;
    // Reading browser settings must wait for hydration; the server can't see them.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSuggested(suggestLanguage(navigator.languages, current));
  }, [current]);

  if (!suggested) return null;
  const language = languages[suggested];

  return (
    <section
      aria-label={t("label")}
      className="border-b bg-muted text-sm text-foreground"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <GlobeIcon aria-hidden className="size-4 shrink-0" />
        <p className="flex-1">
          <Link
            href={pathname}
            locale={suggested}
            lang={suggested}
            onClick={rememberDismissed}
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            <span aria-hidden className="mr-1">
              {language.flag}
            </span>
            {language.suggestion}
          </Link>
        </p>
        <button
          type="button"
          aria-label={t("dismiss")}
          onClick={() => {
            rememberDismissed();
            setSuggested(null);
          }}
          className="grid size-7 shrink-0 place-items-center rounded-md hover:bg-foreground/10"
        >
          <XIcon aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}
