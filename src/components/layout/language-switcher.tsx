"use client";

import { CheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { languages } from "@/i18n/languages";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_PREFERENCE_COOKIE } from "@/i18n/resolve-ui-locale";
import { routing, type Locale } from "@/i18n/routing";
import { saveUiLocale } from "@/lib/preferences/save-ui-locale";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_PREFERENCE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const active = languages[current];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold hover:bg-accent"
        >
          <span aria-hidden className="text-base leading-none">
            {active.flag}
          </span>
          {/* Visible code first, so the accessible name starts with what is shown (WCAG 2.5.3). */}
          {active.shortCode}
          <span className="sr-only">
            , {t("label", { language: active.nativeName })}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-3">
        <p className="mb-2 px-1 text-sm font-medium text-muted-foreground">
          {t("title")}
        </p>
        <ul className="grid grid-cols-2 gap-2">
          {routing.locales.map((locale) => {
            const language = languages[locale];
            const isCurrent = locale === current;
            return (
              <li key={locale}>
                <Link
                  href={pathname}
                  locale={locale}
                  lang={locale}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={(event) => {
                    // Let modified clicks (new tab, new window) behave as links.
                    if (event.metaKey || event.ctrlKey || event.shiftKey) {
                      return;
                    }
                    event.preventDefault();
                    rememberLocale(locale);
                    setOpen(false);
                    // A signed-in Student's choice is also saved to their
                    // profile; wait for it so the save is never cut short.
                    startTransition(async () => {
                      await saveUiLocale(locale);
                      router.push(pathname, { locale });
                    });
                  }}
                  className="flex items-center gap-2 rounded-xl border p-3 hover:bg-accent aria-[current]:border-primary aria-[current]:bg-accent"
                >
                  <span aria-hidden className="text-2xl leading-none">
                    {language.flag}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-semibold">{language.nativeName}</span>
                    <span aria-hidden className="text-xs text-muted-foreground">
                      {language.shortCode}
                    </span>
                  </span>
                  {isCurrent && (
                    <CheckIcon aria-hidden className="ml-auto size-4" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
