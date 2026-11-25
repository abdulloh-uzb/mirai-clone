import { CheckIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { languages } from "@/i18n/languages";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * One card per Course language. Each is a plain link to `?course=<lang>`, so
 * choosing works without JavaScript; the chosen card is marked current.
 */
export async function LanguageCards({ selected }: { selected: Locale }) {
  const t = await getTranslations("Courses");
  return (
    <nav aria-label={t("languagesLabel")}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {routing.locales.map((lang) => {
          const isSelected = lang === selected;
          return (
            <li key={lang}>
              <Link
                href={{ pathname: "/courses", query: { course: lang } }}
                scroll={false}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-4 shadow-xs transition-colors hover:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  isSelected && "border-primary ring-2 ring-primary/30",
                )}
              >
                <span aria-hidden className="text-3xl">
                  {languages[lang].flag}
                </span>
                <span className="grid flex-1">
                  <span lang={lang} className="font-semibold">
                    {languages[lang].nativeName}
                  </span>
                  {lang === routing.defaultLocale ? (
                    <span className="text-sm text-muted-foreground">
                      {t("originalCourse")}
                    </span>
                  ) : null}
                </span>
                <span className="rounded-full bg-brand-green px-2 py-0.5 text-xs font-extrabold tracking-wide text-[#0f1217]">
                  {t("live")}
                </span>
                {isSelected ? (
                  <CheckIcon
                    aria-label={t("selected")}
                    className="size-5 text-primary"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
