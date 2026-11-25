import "server-only";
import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import { isSiteIndexable, publicEnv } from "@/lib/env";
import { buildPageMetadata, type PageMetadataInput } from "./metadata";

/** `buildPageMetadata` with the site URL and indexing flag filled in from env. */
export function pageMetadata(
  input: Omit<PageMetadataInput, "siteUrl" | "indexable"> & {
    locale: Locale;
  },
): Metadata {
  return buildPageMetadata({
    ...input,
    siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
    indexable: isSiteIndexable(),
  });
}
