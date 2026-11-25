import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ja", "es", "ru"],
  defaultLocale: "en",
  // `en` has no prefix; `ja`, `es`, `ru` do. `/en/x` redirects to `/x`.
  localePrefix: "as-needed",
  // The URL is the only source of the UI language here. No Accept-Language or
  // cookie redirects: an explicit URL always wins (spec section 12).
  localeDetection: false,
  // We manage our own preference cookie (ticket 02).
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
