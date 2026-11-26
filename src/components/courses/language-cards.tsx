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
export async function LanguageCards({
  selected,
  pathname = "/courses",
}: {
  selected: Locale;
  pathname?: "/courses" | "/portal";
}) {
  const t = await getTranslations("Courses");
  return (
    <nav aria-label={t("languagesLabel")}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        {routing.locales.map((lang) => {
          const isSelected = lang === selected;
          return (
            <li key={lang}>
              <Link
                href={{ pathname, query: { course: lang } }}
                scroll={false}
                aria-current={isSelected ? "true" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 bg-card p-4 shadow-sm transition-colors hover:border-brand-green focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  isSelected &&
                    "border-brand-green bg-surface-mint ring-2 ring-brand-green/30",
                )}
              >
                {/* A code badge, not an emoji flag: emoji fonts are slow to load and lay out. */}
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-full bg-muted text-sm font-extrabold"
                >
                  {languages[lang].shortCode}
                </span>
                <span className="grid flex-1">
                  {/* The device's own CJK font draws 日本語, so the Noto Sans JP webfont is not downloaded just for this label. */}
                  <span
                    lang={lang}
                    className="font-semibold"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
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
                    className="size-6 rounded-full bg-brand-green p-1 text-[#0f1217]"
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
