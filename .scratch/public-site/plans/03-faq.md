# Plan 03: FAQ

**Goal:** build `.scratch/public-site/issues/03-faq.md`: `/faq` with ~36 seeded questions in 10 categories, count line, client-side search, popular shortcuts, `#slug` deep links and `FAQPage` JSON-LD.

## Files

- `supabase/migrations/<ts>_faq_categories.sql` (new): see Data. Regenerate `src/lib/database.types.ts`.
- `supabase/seed/faq.sql` (new): loaded by `[db.seed] sql_paths` in `supabase/config.toml` (added by ticket 04; confirm it's on the integration branch).
- `src/lib/faq/categories.ts` (new, pure): `FAQ_CATEGORIES = ["about","course","exam","certificates","payments","eligibility","language","ai","classroom","contact"] as const` in display order, `type FaqCategory`. These are a check constraint, not a DB enum, so the const list is allowed; add a comment pointing at the migration so they stay in sync.
- `src/lib/faq/faq.ts` (new, server-only): cached reads (`cachedContent`, tag `contentTags.faq`, `src/lib/content/cache.ts`) with `createAnonClient()`:
  - `listFaq(locale): Promise<FaqEntry[]>` — published rows in `locale` and `en`, merged per slug with `pickTranslations` (`src/lib/content/translation.ts`), sorted by category order then `position`.
  - `listFeaturedFaq(locale): Promise<FaqEntry[]>` — the 4 `featured` entries (ticket 09 uses it on the home page).
- `src/lib/faq/search.ts` (new, pure): `faqSearchText(entry)` (title + body with Markdown syntax stripped, lower-cased, accents folded) and `matchesFaqQuery(text, query)`. Unit-tested.
- `src/components/faq/faq-list.tsx` (server): one `<section>` per category with an `h2` (label from messages) and a native `<details id={slug}>`/`<summary>` per item (works without JS, keyboard-accessible); body via `Markdown` (`src/components/content/markdown.tsx`); a fallback item shows `NotTranslatedNotice` inside it. Each `<details>` carries `data-search={faqSearchText(entry)}`.
- `src/components/faq/faq-search.tsx` (client): labelled search input, popular shortcut buttons (refund, final exam, certificate, password — labels and search terms from messages, so each language searches in its own words), live result count (`aria-live="polite"`), "No answers match" message. Filters by toggling `hidden` on `[data-search]` items and hiding empty category sections. Without JS the full list shows.
- `src/components/faq/faq-hash.tsx` (client, tiny): on mount and on `hashchange`, find `details#<hash>`, set `open`, `scrollIntoView`, focus its `summary`.
- `src/app/[locale]/faq/page.tsx` (new): H1 "Find an answer", count line "{count} answers in {categories} categories" (ICU plural), search, list, `FAQPage` JSON-LD, metadata via `pageMetadata` (all locales: the page itself exists in every language).
- `src/lib/seo/json-ld.ts` (from ticket 04): add `faqPage(entries: { question: string; answer: string }[])` (answer = Markdown-stripped text). Render with `<JsonLd>` (`src/components/seo/json-ld.tsx`).
- `src/lib/seo/sitemap-pages.ts`: add `{ path: "/faq" }`.
- `messages/{en,ja,es,ru}.json`: namespace `Faq` (H1, count line, search label/placeholder, shortcuts, no results, category labels, metadata).

## Data

Migration:
- `alter table public.faq_items add column category text not null check (category in (...10 keys...))` (the table has no rows anywhere yet, so no default is needed; if `add column ... not null` fails on a non-empty table, add with a temporary default and drop it).
- `add column featured boolean not null default false`.
- Index `(locale, category, position)`.
- The existing "anyone reads published" policy stays.
- `TODO(spec):` comment: spec says "9 categories" but lists 10 groups; all 10 are used.

Seed `supabase/seed/faq.sql`: ~36 slugs (3–4 per category) × 4 languages, all `published = true`, English slugs, same `category`/`position`/`featured` across languages. Exactly 4 slugs `featured` (one each from course, exam, certificates, payments is a good mix). Facts must match `spec.md`: 8 sections; 25-question final exam, pass 70% (18/25), 2 attempts, unlimited section-quiz retries; 90 days of access; refunds 100% (≤ 7 days, no lesson started) / 50% (≤ 7 days, lessons started, final exam not started) / 0% (> 7 days, or final exam started, or certificate issued); completions reported to the DMV 3 times a day (09:00, 13:00, 17:00 Pacific); course in en/ja/es/ru; AI assistant is educational only and off during the exam; classroom $124.99 is waitlist only. Include slugs that the popular shortcuts hit (`refund`, `final exam`, `certificate`, `password`, e.g. a "How do I reset my password?" item). Never name the school (the brand lives only in `siteConfig`; `scripts/check-conventions.ts` scans `supabase/`): say "we"/"the school". No real company names. Non-English rows get a SQL comment that a native speaker must review them before launch. Markdown bodies, short (1–3 paragraphs or a list).

## Interfaces

```ts
type FaqEntry = { slug: string; category: FaqCategory; title: string; body: string; featured: boolean; isFallback: boolean };
listFaq(locale: Locale): Promise<FaqEntry[]>
listFeaturedFaq(locale: Locale): Promise<FaqEntry[]>
faqSearchText(entry: Pick<FaqEntry, "title" | "body">): string
matchesFaqQuery(text: string, query: string): boolean
faqPage(entries: { question: string; answer: string }[]): object
```

## Test slices (in order)

1. DB `tests/db/faq.db.test.ts`: a Visitor reads published items with `category` and `featured`; exactly 4 featured slugs per language; an unpublished item inserted with the service client is invisible to a Visitor (clean it up); the category check rejects an unknown value.
2. Unit `src/lib/faq/search.test.ts`: matches on title, on body, strips Markdown, case/accent-insensitive, empty query matches.
3. Unit: `faqPage` shape (`json-ld.test.ts`).
4. E2E `tests/e2e/faq.spec.ts`: `/faq` and `/ja/faq` render H1 and the count line; typing "password" filters to the password item; clicking the "Refund" shortcut filters; `/faq#<slug>` opens that `<details>`; `FAQPage` JSON-LD present with ~36 questions; axe clean.
5. E2E `tests/e2e/faq.mobile.spec.ts`: search at 375 px.

## Risks

- No correct exam answers or question-bank content in FAQ text (exam integrity).
- Facts must not contradict `spec.md`.
- Brand values only via `siteConfig`.
- Message key parity across 4 languages (`tests/unit/messages.test.ts`).
- Other tickets may add to `sitemap-pages.ts`, `json-ld.ts` and `messages/*.json` in parallel: merge the integration tip and resolve.
