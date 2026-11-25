import type { Locale } from "./routing";

/**
 * How each UI language presents itself in the switcher and the language
 * suggestion banner. Written in the language itself, never translated: a
 * reader must recognise their own language whatever the page is in.
 */
export const languages: Record<
  Locale,
  { nativeName: string; shortCode: string; flag: string; suggestion: string }
> = {
  en: {
    nativeName: "English",
    shortCode: "EN",
    flag: "🇺🇸",
    suggestion: "View this page in English",
  },
  ja: {
    nativeName: "日本語",
    shortCode: "JA",
    flag: "🇯🇵",
    suggestion: "このページを日本語で表示",
  },
  es: {
    nativeName: "Español",
    shortCode: "ES",
    flag: "🇪🇸",
    suggestion: "Ver esta página en español",
  },
  ru: {
    nativeName: "Русский",
    shortCode: "RU",
    flag: "🇷🇺",
    suggestion: "Открыть эту страницу на русском",
  },
};
