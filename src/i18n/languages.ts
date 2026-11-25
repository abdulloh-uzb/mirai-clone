import type { Locale } from "./routing";

/**
 * How each UI language presents itself in the switcher and the language
 * suggestion banner. Written in the language itself, never translated: a
 * reader must recognise their own language whatever the page is in.
 */
export const languages: Record<
  Locale,
  {
    nativeName: string;
    englishName: string;
    shortCode: string;
    flag: string;
    suggestion: string;
  }
> = {
  en: {
    nativeName: "English",
    englishName: "English",
    shortCode: "EN",
    flag: "🇺🇸",
    suggestion: "View this page in English",
  },
  ja: {
    nativeName: "日本語",
    englishName: "Japanese",
    shortCode: "JA",
    flag: "🇯🇵",
    suggestion: "このページを日本語で表示",
  },
  es: {
    nativeName: "Español",
    englishName: "Spanish",
    shortCode: "ES",
    flag: "🇪🇸",
    suggestion: "Ver esta página en español",
  },
  ru: {
    nativeName: "Русский",
    englishName: "Russian",
    shortCode: "RU",
    flag: "🇷🇺",
    suggestion: "Открыть эту страницу на русском",
  },
};
