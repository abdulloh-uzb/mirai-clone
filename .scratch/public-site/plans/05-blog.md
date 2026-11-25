# Plan 05: Blog

**Goal:** build `.scratch/public-site/issues/05-blog.md`: `/blog` and `/blog/[slug]` with 6 seeded posts in 3 categories and 4 languages, category filter, related posts, SVG covers and `Article` + `BreadcrumbList` JSON-LD.

## Files

- `supabase/migrations/<ts>_post_categories.sql` (new): `alter table public.posts add column category text not null check (category in ('traffic-school','california-driving','after-your-ticket'))` (table is empty everywhere; if not, add with a temporary default and drop it); index `(locale, category, published_at desc)`. Regenerate DB types.
- `supabase/seed/posts.sql` (new): see Data.
- `src/lib/blog/categories.ts` (new, pure): `POST_CATEGORIES` const (same order as the check), `type PostCategory`, `isPostCategory()`, `coverImage(category)` → `/placeholder/blog-<category>.svg`.
- `src/lib/blog/posts.ts` (new, server-only, `cachedContent` tag `posts`, `createAnonClient()`):
  - `listPosts(locale, category?)`: published rows in `locale` + `en`, `pickTranslations`, newest `published_at` first, filtered by category.
  - `getPost(slug, locale)`: `pickTranslation` over the slug's published rows (gives `availableLocales` for hreflang and `isFallback`).
  - `relatedPosts(post, locale)`: up to 3 others in the same category, newest first.
  - `postSitemapPages()`: one `SitemapPage` per slug with `locales` = languages that have a published row and `lastModified` = `updated_at`; register it in `dynamicSitemapSources` in `src/lib/seo/sitemap-pages.ts`; also add `{ path: "/blog" }` to the static pages.
- `public/placeholder/blog-traffic-school.svg`, `blog-california-driving.svg`, `blog-after-your-ticket.svg` (new): original SVG art, 1200×630 viewBox (used as OG images and card covers). Cards use them with `alt=""` (decorative; the title is the link text).
- `src/components/blog/post-card.tsx`: cover, category label, date (`<time>`), title link, excerpt.
- `src/app/[locale]/blog/page.tsx`: H1, category filter as links (`/blog`, `/blog?category=…`) with `aria-current` on the active one; unknown category → show all (no error); list; metadata (canonical `/blog` without the query).
- `src/app/[locale]/blog/[slug]/page.tsx`: unknown slug → `notFound()`; breadcrumb nav (Home › Blog › title); category, date, title, `NotTranslatedNotice` when falling back, `Markdown` body, related posts; `Article` + `BreadcrumbList` JSON-LD; metadata with `type: "article"`, `image: coverImage(category)`, `availableLocales`, `isFallback`.
- `src/lib/seo/json-ld.ts` (from ticket 04): add `article({ siteUrl, locale, path, title, description, image, datePublished, dateModified })`; reuse `breadcrumbList`. Publisher name from `siteConfig`.
- `messages/*.json`: `Blog` namespace (H1, intro, filter labels incl. "All", category labels, related heading, breadcrumb labels, metadata).

## Data

Seed `supabase/seed/posts.sql`: 6 English slugs, 2 per category, each with title, excerpt, Markdown body (~300–500 words), `published = true`, distinct `published_at` in 2026. Translations in ja, es, ru for 5 of the 6; leave one slug English-only (SQL comment says it exercises the fallback). Topics: what traffic school is and how it works; how to ask your court for traffic school; California right-of-way basics; driving safely in rain/fog; what happens after you finish the course (certificate, reporting); keeping your record clean. Original text, no third-party brands, no school name (brand only in `siteConfig`), no legal advice (say "check with your court"). Non-English rows get a native-speaker review comment.

## Interfaces

```ts
type PostSummary = { slug: string; category: PostCategory; title: string; excerpt: string; publishedAt: string; isFallback: boolean };
listPosts(locale: Locale, category?: PostCategory): Promise<PostSummary[]>
getPost(slug: string, locale: Locale): Promise<TranslationResult<PostRow> | null>
relatedPosts(post: { slug: string; category: PostCategory }, locale: Locale): Promise<PostSummary[]>
article(input: ArticleInput): object
```

## Test slices (in order)

1. DB `tests/db/posts.db.test.ts`: a Visitor reads 6 published English posts with categories; unpublished post invisible to a Visitor; category check rejects unknown values.
2. Unit: `isPostCategory`, `coverImage`, `article` JSON-LD shape; sitemap entries for a post with 3 vs 4 languages (pure part).
3. E2E `tests/e2e/blog.spec.ts`: `/blog` lists 6 posts newest first; `?category=california-driving` shows 2 with that filter current; a post page in `en` and `es` shows category, date, body, ≤ 3 related posts, `Article` + `BreadcrumbList` JSON-LD; the English-only post under `/ru/blog/<slug>` shows the notice, English canonical and no `ru` hreflang; unknown slug → 404; `sitemap.xml` lists the post URLs; axe clean on list and post.

## Risks

- Brand values only via `siteConfig`.
- Correct canonical/hreflang on fallback (ADR 0004).
- Parallel tickets edit `sitemap-pages.ts`, `json-ld.ts`, `messages/*.json`: merge the integration tip and resolve.
