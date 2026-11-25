import type { Locale } from "@/i18n/routing";

/** One page for the sitemap: its unprefixed path and the languages it exists in. */
export type SitemapPage = {
  path: string;
  /** Defaults to all UI languages. */
  locales?: readonly Locale[];
  lastModified?: Date;
};

/**
 * Public pages with fixed paths, in every UI language. Each phase 2 ticket
 * adds its pages here; pages read from the database (Counties, blog posts)
 * are added through `dynamicSitemapSources` instead.
 */
export const staticSitemapPages: readonly SitemapPage[] = [
  { path: "/" },
  { path: "/contact" },
  { path: "/accessibility" },
  { path: "/courts" },
  { path: "/faq" },
  { path: "/dmv-services" },
];

/**
 * Readers for database-driven pages. Each returns its pages; a failing reader
 * is skipped so one broken table never empties the whole sitemap.
 */
export const dynamicSitemapSources: readonly (() => Promise<SitemapPage[]>)[] =
  [
    // Every County page, in all four languages (the template is in messages).
    async () => {
      const { listCounties } = await import("@/lib/courts/counties");
      const counties = await listCounties();
      return counties.map((county) => ({ path: `/courts/${county.slug}` }));
    },
  ];
