import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

/** Cookie that remembers a Visitor's chosen UI language (set by the switcher). */
export const LOCALE_PREFERENCE_COOKIE = "ui_locale";

export type UiLocaleResolution = { locale: Locale; redirectTo?: string };

/**
 * The UI language rule (spec, Internationalisation), in priority order:
 * 1. a language named in the URL always wins;
 * 2. otherwise, for the bare root `/` only, a saved preference may redirect;
 * 3. otherwise English. A deep unprefixed path such as `/faq` never redirects.
 *
 * `preference` is the profile's UI language for a signed-in Student, or the
 * cookie for a Visitor (the proxy picks which).
 */
export function resolveUiLocale({
  pathname,
  preference,
}: {
  pathname: string;
  preference: string | null | undefined;
}): UiLocaleResolution {
  const firstSegment = pathname.split("/")[1] ?? "";
  if (hasLocale(routing.locales, firstSegment)) {
    return { locale: firstSegment };
  }

  if (
    pathname === "/" &&
    hasLocale(routing.locales, preference) &&
    preference !== routing.defaultLocale
  ) {
    return { locale: preference, redirectTo: `/${preference}` };
  }

  return { locale: routing.defaultLocale };
}
