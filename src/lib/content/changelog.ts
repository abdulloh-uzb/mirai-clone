import "server-only";
import type { Locale } from "@/i18n/routing";
import { createAnonClient } from "@/lib/supabase/anon";
import { cachedContent, contentTags } from "./cache";
import { pickTranslations, type TranslationResult } from "./translation";

export type ChangelogRow = {
  locale: string;
  slug: string;
  title: string;
  body: string;
  published_at: string;
};

const readChangelogRows = cachedContent(
  async (): Promise<ChangelogRow[]> => {
    const { data, error } = await createAnonClient()
      .from("changelog")
      .select("locale, slug, title, body, published_at")
      .eq("published", true)
      .not("published_at", "is", null);
    if (error) throw error;
    return data.flatMap((row) =>
      row.published_at ? [{ ...row, published_at: row.published_at }] : [],
    );
  },
  "changelog-rows",
  contentTags.changelog,
);

/** Published "What's new" entries in the language (English where missing), newest first. */
export async function listChangelog(
  locale: Locale,
): Promise<(TranslationResult<ChangelogRow> & { slug: string })[]> {
  return pickTranslations(await readChangelogRows(), locale).sort((a, b) =>
    b.item.published_at.localeCompare(a.item.published_at),
  );
}
