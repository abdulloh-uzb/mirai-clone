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
import { LanguageTrigger } from "./language-trigger";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { rememberLocale } from "@/i18n/remember-locale";
import { routing } from "@/i18n/routing";
import { saveUiLocale } from "@/lib/preferences/save-ui-locale";

export function LanguageSwitcherPopover({ label }: { label: string }) {
  const t = useTranslations("LanguageSwitcher");
  const current = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  // Mounted by the click that asked for it, so it starts open.
  const [open, setOpen] = useState(true);
  const [, startTransition] = useTransition();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <LanguageTrigger label={label} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 rounded-2xl p-3 shadow-lg">
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
                  className="relative flex items-center gap-2 rounded-[10px] border-2 border-soft-border bg-card p-2.5 hover:bg-accent aria-[current]:border-brand-green aria-[current]:bg-[#edfae7] aria-[current]:text-[#0f1217]"
                >
                  <span
                    aria-hidden
                    className="absolute top-1 left-1.5 size-1 rounded-full bg-soft-border"
                  />
                  <span
                    aria-hidden
                    className="absolute top-1 right-1.5 size-1 rounded-full bg-soft-border"
                  />
                  <span
                    aria-hidden
                    className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-lg leading-none"
                  >
                    {language.flag}
                  </span>
                  <span className="flex flex-col">
                    <span className="text-sm font-bold">
                      {language.nativeName}
                    </span>
                    <span aria-hidden className="text-[11px] opacity-70">
                      {language.englishName}
                    </span>
                  </span>
                  {isCurrent && (
                    <CheckIcon
                      aria-hidden
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-brand-green p-0.5 text-[#0f1217]"
                    />
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
