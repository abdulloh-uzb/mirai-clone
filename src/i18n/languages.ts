import type { Locale } from "./routing";

/** How each UI language presents itself in the switcher (native names, never translated). */
export const languages: Record<
  Locale,
  { nativeName: string; shortCode: string; flag: string }
> = {
  en: { nativeName: "English", shortCode: "EN", flag: "🇺🇸" },
  ja: { nativeName: "日本語", shortCode: "JA", flag: "🇯🇵" },
  es: { nativeName: "Español", shortCode: "ES", flag: "🇪🇸" },
  ru: { nativeName: "Русский", shortCode: "RU", flag: "🇷🇺" },
};
