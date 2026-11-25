import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import en from "../../messages/en.json";
import { withEnglishFallback, type Messages } from "./fallback";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  if (locale === "en") return { locale, messages: en };

  const translated = (await import(`../../messages/${locale}.json`)) as {
    default: Messages;
  };
  // TODO(spec): a missing translation falls back to English here; flag it in admin (phase 5).
  return { locale, messages: withEnglishFallback(en, translated.default) };
});
