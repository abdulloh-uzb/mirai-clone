import { hasLocale } from "next-intl";
import { routing, type Locale } from "./routing";

/** Cookie set when the language suggestion banner is dismissed or followed. */
export const LANGUAGE_BANNER_DISMISSED_COOKIE = "lang_banner_dismissed";

/**
 * The UI language to suggest, from the browser's preferred languages (most
 * preferred first, e.g. `navigator.languages`): the first one we support,
 * matched on its primary subtag (`ru-RU` → `ru`). Null when that is already
 * the page's language or none is supported. Never used to redirect.
 */
export function suggestLanguage(
  browserLanguages: readonly string[],
  current: Locale,
): Locale | null {
  for (const tag of browserLanguages) {
    const primary = tag.split("-")[0]?.toLowerCase();
    if (hasLocale(routing.locales, primary)) {
      return primary === current ? null : primary;
    }
  }
  return null;
}
