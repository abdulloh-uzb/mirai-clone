import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { localePrefix } from "@/i18n/locale-path";
import { routing, type Locale } from "@/i18n/routing";

/** Default share image (1200×630), used when a page has none of its own. */
export const DEFAULT_OG_IMAGE = "/placeholder/og-default.png";

/** Open Graph locale codes for each UI language. */
const ogLocales: Record<Locale, string> = {
  en: "en_US",
  ja: "ja_JP",
  es: "es_US",
  ru: "ru_RU",
};

/**
 * The absolute URL of a page in a UI language: `/faq` in `ja` gives
 * `https://site/ja/faq`; the home page in `ja` gives `https://site/ja`.
 */
export function localizedUrl(siteUrl: string, locale: Locale, path: string) {
  const base = siteUrl.replace(/\/+$/, "");
  const prefix = localePrefix(locale);
  const rest = path === "/" && prefix ? "" : path;
  return `${base}${prefix}${rest}`;
}

export type PageMetadataInput = {
  siteUrl: string;
  /** The UI language of the URL being rendered. */
  locale: Locale;
  /** The path without a language prefix, starting with `/`. */
  path: string;
  title: string;
  description: string;
  /** Site-relative or absolute share image; the default image when omitted. */
  image?: string;
  /**
   * UI languages that have their own version of this page. Defaults to all.
   * Content pages pass only the languages with a published Translation.
   */
  availableLocales?: readonly Locale[];
  /** True when the page shows the English text because its own is missing. */
  isFallback?: boolean;
  indexable: boolean;
  type?: "website" | "article";
};

/**
 * Metadata every public page shares: canonical, hreflang alternates with
 * `x-default`, Open Graph, Twitter card and robots. A fallback page points its
 * canonical at the English page so the duplicate is never indexed (ADR 0004).
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const {
    siteUrl,
    locale,
    path,
    title,
    description,
    availableLocales = routing.locales,
    isFallback = false,
    indexable,
    type = "website",
  } = input;

  const canonicalLocale = isFallback ? routing.defaultLocale : locale;
  const canonical = localizedUrl(siteUrl, canonicalLocale, path);

  const languages: Record<string, string> = {};
  for (const other of routing.locales) {
    if (availableLocales.includes(other)) {
      languages[other] = localizedUrl(siteUrl, other, path);
    }
  }
  languages["x-default"] = localizedUrl(siteUrl, routing.defaultLocale, path);

  const image = input.image ?? DEFAULT_OG_IMAGE;
  const imageUrl = /^https?:\/\//.test(image)
    ? image
    : `${siteUrl.replace(/\/+$/, "")}${image}`;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale: ogLocales[locale],
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}
