import type { MetadataRoute } from "next";
import { isSiteIndexable, publicEnv } from "@/lib/env";

// Read the indexing flag at request time, not build time.
export const dynamic = "force-dynamic";

/** Everything is disallowed unless `SITE_INDEXABLE=true` (phase 2 spec). */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  if (!isSiteIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/portal", "/admin", "/api/", "/*/portal", "/*/admin"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
