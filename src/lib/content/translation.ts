import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";

export type TranslationResult<T> = {
  /** The row to show: the requested language's, or the English one. */
  item: T;
  /** True when the requested language had no row and English is shown instead. */
  isFallback: boolean;
  /** Every UI language that has its own row, in routing order (for hreflang). */
  availableLocales: Locale[];
};

/**
 * Picks the Translation of one content item to show (ADR 0004). `rows` are the
 * published rows of one slug, in any languages. Returns the requested
 * language's row, else the English row flagged as a fallback, else null.
 */
export function pickTranslation<T extends { locale: string }>(
  rows: readonly T[],
  locale: Locale,
): TranslationResult<T> | null {
  const byLocale = new Map<Locale, T>();
  for (const row of rows) {
    if (hasLocale(routing.locales, row.locale)) byLocale.set(row.locale, row);
  }
  const availableLocales = routing.locales.filter((l) => byLocale.has(l));

  const own = byLocale.get(locale);
  if (own) return { item: own, isFallback: false, availableLocales };
  const english = byLocale.get(routing.defaultLocale);
  if (english) return { item: english, isFallback: true, availableLocales };
  return null;
}

/**
 * For lists: one row per slug, each in the requested language when it has
 * one, else in English. Slugs with neither are dropped. Keeps the order of
 * the first row seen for each slug.
 */
export function pickTranslations<T extends { locale: string; slug: string }>(
  rows: readonly T[],
  locale: Locale,
): (TranslationResult<T> & { slug: string })[] {
  const bySlug = new Map<string, T[]>();
  for (const row of rows) {
    const group = bySlug.get(row.slug);
    if (group) group.push(row);
    else bySlug.set(row.slug, [row]);
  }
  return [...bySlug].flatMap(([slug, group]) => {
    const picked = pickTranslation(group, locale);
    return picked ? [{ ...picked, slug }] : [];
  });
}
