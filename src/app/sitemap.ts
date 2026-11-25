import type { MetadataRoute } from "next";
import { publicEnv } from "@/lib/env";
import { buildSitemap } from "@/lib/seo/sitemap";
import {
  dynamicSitemapSources,
  staticSitemapPages,
} from "@/lib/seo/sitemap-pages";

// Built per request: database-driven pages change without a rebuild.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicPages = await Promise.all(
    dynamicSitemapSources.map((read) =>
      read().catch((error: unknown) => {
        console.error("Sitemap source failed", error);
        return [];
      }),
    ),
  );
  return buildSitemap(publicEnv.NEXT_PUBLIC_SITE_URL, [
    ...staticSitemapPages,
    ...dynamicPages.flat(),
  ]);
}
