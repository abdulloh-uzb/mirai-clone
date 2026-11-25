import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

export type LocalePath = {
  /** The UI language named by the first path segment, or null when none is. */
  locale: Locale | null;
  /** The rest of the path (query included), always starting with `/`. */
  path: string;
};

/**
 * Splits a site path into the UI language its first segment names and the
 * rest: `/ja/portal?x=1` gives `ja` and `/portal?x=1`. A path with no
 * language segment comes back unchanged with a null locale.
 */
export function splitLocalePath(path: string): LocalePath {
  const match = /^\/([^/?#]*)([\s\S]*)$/.exec(path);
  const first = match?.[1];
  if (!match || !hasLocale(routing.locales, first)) {
    return { locale: null, path };
  }
  const rest = match[2] ?? "";
  return { locale: first, path: rest.startsWith("/") ? rest : `/${rest}` };
}

/** The URL prefix of a UI language: `/ja`, or "" for English (no prefix) and for none. */
export function localePrefix(locale: Locale | null): string {
  return locale && locale !== routing.defaultLocale ? `/${locale}` : "";
}
