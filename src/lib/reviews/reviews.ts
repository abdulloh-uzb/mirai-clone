import "server-only";
import type { Locale } from "@/i18n/routing";
import { cachedContent, contentTags } from "@/lib/content/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import type { Review } from "./rating";

/**
 * Published reviews written in the language. Reviews are not Translations of
 * each other, so there is no English fallback: each language has its own.
 */
export const listReviews = cachedContent(
  async (locale: Locale): Promise<Review[]> => {
    const { data, error } = await createAnonClient()
      .from("reviews")
      .select("slug, title, body, author_name, rating, is_sample")
      .eq("locale", locale)
      .eq("published", true)
      .order("slug");
    if (error) throw error;
    return data.map((row) => ({
      slug: row.slug,
      title: row.title,
      body: row.body,
      authorName: row.author_name,
      rating: row.rating,
      isSample: row.is_sample,
    }));
  },
  "reviews",
  contentTags.reviews,
);
