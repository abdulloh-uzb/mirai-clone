import "server-only";
import type { Locale } from "@/i18n/routing";
import { createAnonClient } from "@/lib/supabase/anon";
import { cachedContent, contentTags } from "./cache";
import { pickTranslation, type TranslationResult } from "./translation";

export type PageRow = {
  locale: string;
  slug: string;
  title: string;
  body: string;
  updated_at: string;
};

const readPageRows = cachedContent(
  async (slug: string): Promise<PageRow[]> => {
    const { data, error } = await createAnonClient()
      .from("pages")
      .select("locale, slug, title, body, updated_at")
      .eq("slug", slug)
      .eq("published", true);
    if (error) throw error;
    return data;
  },
  "page-rows",
  contentTags.pages,
);

/** A content page in the language, or its English fallback; null if unpublished. */
export async function getPage(
  slug: string,
  locale: Locale,
): Promise<TranslationResult<PageRow> | null> {
  return pickTranslation(await readPageRows(slug), locale);
}
