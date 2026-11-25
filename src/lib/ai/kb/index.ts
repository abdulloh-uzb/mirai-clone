import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Knowledge base for the assistant: published FAQ, policy pages, posts and
// county instructions, cut into ~800 character chunks in `kb_chunks`.
// Takes the service client from the caller (admin button, script, chat route).

type Client = SupabaseClient<Database>;
type Locale = "en" | "ja" | "es" | "ru";

const CHUNK_SIZE = 800;
const POLICY_SLUGS = ["school-rules", "refund-policy", "terms", "privacy"];

export type Chunk = {
  source: string;
  locale: Locale;
  title: string;
  url: string;
  content: string;
};

/** Public path with the locale prefix (`en` has none). */
export function localizedPath(locale: Locale, path: string): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

/** Splits text on paragraph/sentence edges into pieces of at most `size` characters. */
export function chunkText(text: string, size = CHUNK_SIZE): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (!clean) return [];
  const pieces = clean
    .split(/\n{2,}|(?<=[.!?。！？])\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (let piece of pieces) {
    while (piece.length > size) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      chunks.push(piece.slice(0, size));
      piece = piece.slice(size);
    }
    if (current && current.length + piece.length + 1 > size) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? `${current} ${piece}` : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function toChunks(
  source: string,
  locale: Locale,
  title: string,
  url: string,
  body: string,
): Chunk[] {
  return chunkText(`${title}\n\n${body}`).map((content) => ({
    source,
    locale,
    title,
    url,
    content,
  }));
}

/** Deletes and rebuilds `kb_chunks`. Returns how many chunks were written. */
export async function reindexKnowledgeBase(client: Client): Promise<number> {
  const chunks: Chunk[] = [];

  const { data: faq, error: faqError } = await client
    .from("faq_items")
    .select("locale, slug, title, body")
    .eq("published", true);
  if (faqError) throw faqError;
  for (const item of faq) {
    chunks.push(
      ...toChunks(
        "faq",
        item.locale as Locale,
        item.title,
        `${localizedPath(item.locale as Locale, "/faq")}#${item.slug}`,
        item.body,
      ),
    );
  }

  const { data: pages, error: pagesError } = await client
    .from("pages")
    .select("locale, slug, title, body")
    .eq("published", true)
    .in("slug", POLICY_SLUGS);
  if (pagesError) throw pagesError;
  for (const page of pages) {
    chunks.push(
      ...toChunks(
        `page:${page.slug}`,
        page.locale as Locale,
        page.title,
        localizedPath(page.locale as Locale, `/${page.slug}`),
        page.body,
      ),
    );
  }

  const { data: posts, error: postsError } = await client
    .from("posts")
    .select("locale, slug, title, excerpt, body")
    .eq("published", true);
  if (postsError) throw postsError;
  for (const post of posts) {
    chunks.push(
      ...toChunks(
        "post",
        post.locale as Locale,
        post.title,
        localizedPath(post.locale as Locale, `/blog/${post.slug}`),
        `${post.excerpt}\n\n${post.body}`,
      ),
    );
  }

  const { data: counties, error: countiesError } = await client
    .from("counties")
    .select("slug, name, seat_city, instructions, courts(name, city, address)");
  if (countiesError) throw countiesError;
  for (const county of counties) {
    const instructions =
      typeof county.instructions === "object" &&
      county.instructions !== null &&
      !Array.isArray(county.instructions)
        ? (county.instructions as Record<string, unknown>)
        : {};
    const courthouses = county.courts
      .map((c) => `${c.name}, ${c.address ?? c.city}`)
      .join("; ");
    for (const locale of ["en", "ja", "es", "ru"] as const) {
      const text = instructions[locale];
      if (typeof text !== "string" || !text.trim()) continue;
      const title = `${county.name} County`;
      chunks.push(
        ...toChunks(
          "county",
          locale,
          title,
          localizedPath(locale, `/courts/${county.slug}`),
          // Courthouse names are not translated, so they ride on every locale.
          `${text}\n\n${courthouses}`,
        ),
      );
    }
  }

  const { error: deleteError } = await client
    .from("kb_chunks")
    .delete()
    .not("id", "is", null);
  if (deleteError) throw deleteError;

  for (let i = 0; i < chunks.length; i += 200) {
    const { error } = await client
      .from("kb_chunks")
      .insert(chunks.slice(i, i + 200));
    if (error) throw error;
  }
  return chunks.length;
}
