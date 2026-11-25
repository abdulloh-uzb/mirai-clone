import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { localizedUrl } from "./metadata";
import type { SitemapPage } from "./sitemap-pages";

/**
 * Sitemap entries: one per page per language, each listing the page's other
 * languages as alternates (plus `x-default` → English).
 */
export function buildSitemap(
  siteUrl: string,
  pages: readonly SitemapPage[],
): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const locales = page.locales ?? routing.locales;
    const languages: Record<string, string> = {};
    for (const locale of locales) {
      languages[locale] = localizedUrl(siteUrl, locale, page.path);
    }
    languages["x-default"] = localizedUrl(
      siteUrl,
      routing.defaultLocale,
      page.path,
    );
    return locales.map((locale) => ({
      url: localizedUrl(siteUrl, locale, page.path),
      lastModified: page.lastModified,
      alternates: { languages },
    }));
  });
}
