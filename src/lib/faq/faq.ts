import "server-only";
import type { Locale } from "@/i18n/routing";
import { cachedContent, contentTags } from "@/lib/content/cache";
import { pickTranslations } from "@/lib/content/translation";
import { createAnonClient } from "@/lib/supabase/anon";
import { FAQ_CATEGORIES, isFaqCategory, type FaqCategory } from "./categories";

export type FaqEntry = {
  slug: string;
  category: FaqCategory;
  title: string;
  body: string;
  featured: boolean;
  /** True when the question is shown in English because it has no translation. */
  isFallback: boolean;
};

/** Published questions in `locale`, falling back to English per slug, in display order. */
export const listFaq = cachedContent(
  async (locale: Locale): Promise<FaqEntry[]> => {
    const { data, error } = await createAnonClient()
      .from("faq_items")
      .select("slug, locale, category, title, body, featured, position")
      .in("locale", [locale, "en"])
      .eq("published", true);
    if (error) throw error;

    return pickTranslations(data, locale)
      .flatMap(({ item, isFallback, slug }) =>
        isFaqCategory(item.category)
          ? [
              {
                entry: {
                  slug,
                  category: item.category,
                  title: item.title,
                  body: item.body,
                  featured: item.featured,
                  isFallback,
                },
                position: item.position,
              },
            ]
          : [],
      )
      .sort(
        (a, b) =>
          FAQ_CATEGORIES.indexOf(a.entry.category) -
            FAQ_CATEGORIES.indexOf(b.entry.category) || a.position - b.position,
      )
      .map(({ entry }) => entry);
  },
  "list-faq",
  contentTags.faq,
);

/** The featured questions (the home page shows them). */
export async function listFeaturedFaq(locale: Locale): Promise<FaqEntry[]> {
  return (await listFaq(locale)).filter((entry) => entry.featured);
}
