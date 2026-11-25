import { hasLocale } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import type { SitemapPage } from "@/lib/seo/sitemap-pages";

type PostRowForSitemap = { slug: string; locale: string; updated_at: string };

/** One sitemap page per post slug, listing the languages that have a row. */
export function toSitemapPages(rows: PostRowForSitemap[]): SitemapPage[] {
  const bySlug = new Map<string, { locales: Locale[]; updated: number }>();
  for (const row of rows) {
    if (!hasLocale(routing.locales, row.locale)) continue;
    const entry = bySlug.get(row.slug) ?? { locales: [], updated: 0 };
    entry.locales.push(row.locale);
    entry.updated = Math.max(entry.updated, Date.parse(row.updated_at));
    bySlug.set(row.slug, entry);
  }
  return [...bySlug].map(([slug, entry]) => ({
    path: `/blog/${slug}`,
    locales: entry.locales,
    lastModified: new Date(entry.updated),
  }));
}
