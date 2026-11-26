import { LOCALE_PREFERENCE_COOKIE } from "@/i18n/resolve-ui-locale";
import type { Locale } from "@/i18n/routing";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Saves the visitor's language choice in a cookie. Browser only. */
export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_PREFERENCE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
