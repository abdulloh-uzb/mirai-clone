import "server-only";
import type { Locale } from "@/i18n/routing";
import { cachedContent, contentTags } from "@/lib/content/cache";
import {
  pickTranslation,
  pickTranslations,
  type TranslationResult,
} from "@/lib/content/translation";
import { createAnonClient } from "@/lib/supabase/anon";
import { isPostCategory, type PostCategory } from "./categories";
import { toSitemapPages } from "./sitemap";

export type PostSummary = {
  slug: string;
  category: PostCategory;
  title: string;
  excerpt: string;
  publishedAt: string;
  isFallback: boolean;
};

export type PostRow = {
  locale: string;
  slug: string;
  category: PostCategory;
  title: string;
  excerpt: string;
  body: string;
  published_at: string;
  updated_at: string;
};

const COLUMNS =
  "locale, slug, category, title, excerpt, body, published_at, updated_at";

function toRow(raw: {
  locale: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  body: string;
  published_at: string | null;
  updated_at: string;
}): PostRow | null {
  if (!isPostCategory(raw.category) || !raw.published_at) return null;
  return { ...raw, category: raw.category, published_at: raw.published_at };
}

const readRows = cachedContent(
  async (slug?: string): Promise<PostRow[]> => {
    let query = createAnonClient()
      .from("posts")
      .select(COLUMNS)
      .eq("published", true);
    if (slug) query = query.eq("slug", slug);
    const { data, error } = await query.order("published_at", {
      ascending: false,
    });
    if (error) throw error;
    return data.flatMap((raw) => toRow(raw) ?? []);
  },
  "post-rows",
  contentTags.posts,
);

function toSummary(result: TranslationResult<PostRow>): PostSummary {
  const { item, isFallback } = result;
  return {
    slug: item.slug,
    category: item.category,
    title: item.title,
    excerpt: item.excerpt,
    publishedAt: item.published_at,
    isFallback,
  };
}

function newestFirst(a: PostSummary, b: PostSummary) {
  return b.publishedAt.localeCompare(a.publishedAt);
}

/** Published posts in the language (English where missing), newest first. */
export async function listPosts(
  locale: Locale,
  category?: PostCategory,
): Promise<PostSummary[]> {
  const rows = await readRows();
  return pickTranslations(rows, locale)
    .map(toSummary)
    .filter((post) => !category || post.category === category)
    .sort(newestFirst);
}

/** One post in the language, or its English fallback; null for an unknown slug. */
export async function getPost(
  slug: string,
  locale: Locale,
): Promise<TranslationResult<PostRow> | null> {
  const rows = await readRows(slug);
  return pickTranslation(rows, locale);
}

/** Up to 3 other posts in the same category, newest first. */
export async function relatedPosts(
  post: { slug: string; category: PostCategory },
  locale: Locale,
): Promise<PostSummary[]> {
  const posts = await listPosts(locale, post.category);
  return posts.filter((other) => other.slug !== post.slug).slice(0, 3);
}

/** Sitemap pages for every published post. */
export async function postSitemapPages() {
  const rows = await readRows();
  return toSitemapPages(rows);
}
