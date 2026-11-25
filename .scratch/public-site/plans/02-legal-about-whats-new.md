# Plan 02: Legal pages, About, School rules, What's new

**Goal:** build `.scratch/public-site/issues/02-legal-about-whats-new.md`: `/terms`, `/privacy`, `/refund-policy`, `/school-rules`, `/about`, the `/accessibility` statement and `/whats-new`, from seeded `pages` and `changelog` rows with English fallback.

## Files

- `supabase/seed/pages.sql`, `supabase/seed/changelog.sql` (new): loaded by `[db.seed] sql_paths` (ticket 04 added it).
- `src/lib/content/pages.ts` (new, server-only): `getPage(slug, locale): Promise<TranslationResult<PageRow> | null>` — published rows of one slug in all languages (`createAnonClient()`), then `pickTranslation` (`src/lib/content/translation.ts`); cached with `cachedContent` tag `pages`.
- `src/lib/content/changelog.ts` (new, server-only): `listChangelog(locale)` — published rows, `pickTranslations`, newest `published_at` first; tag `changelog`.
- `src/components/content/content-page.tsx` (new, server): shared layout for a `pages` row: H1 = row title, `NotTranslatedNotice` when `isFallback`, `Markdown` body, optional `children` (e.g. contact details, a form) after the body. Also a `contentPageMetadata(slug, locale, path)` helper building `pageMetadata` with `availableLocales` and `isFallback` from the lookup; description = first ~160 chars of the body with Markdown stripped (or a messages fallback).
- Routes (one folder each, each `page.tsx` a few lines): `src/app/[locale]/{terms,privacy,refund-policy,school-rules,about}/page.tsx`. Unknown/unpublished row → `notFound()`. `/about` passes contact details from `siteConfig` (address lines, phone, email) as children.
- `src/app/[locale]/accessibility/page.tsx` (exists from ticket 06): replace the placeholder statement with the `accessibility` `pages` row (same lookup + notice + metadata), keep the ADA form below it, remove its `TODO(ticket 02)` and any messages keys only that placeholder used (in all 4 files).
- `src/app/[locale]/whats-new/page.tsx` (new): H1 from messages, entries newest first, each an `<article id={slug}>` with an `h2` linking to `#slug`, a `<time dateTime>` formatted with the UI language (`useFormatter`/`getFormatter`), `Markdown` body, notice when the entry falls back.
- `src/lib/seo/sitemap-pages.ts`: add the 7 paths (`/terms`, `/privacy`, `/refund-policy`, `/school-rules`, `/about`, `/accessibility`, `/whats-new`).
- `messages/*.json`: `WhatsNew` namespace (H1, intro, metadata) and anything the About contact block needs.
- The announcement bar's "See what's new" link (`spec.md` section 4) → `/whats-new`, if not already present: add it in `src/components/layout/dismissible-announcement.tsx`.

## Data

No migration. Seed `pages` slugs `terms`, `privacy`, `refund-policy`, `school-rules`, `about`, `accessibility`, each in en/ja/es/ru, `published = true`, Markdown bodies:
- Legal pages (terms, privacy, refund-policy, school-rules) start with a line "Demo text, not legal advice." (translated).
- Refund policy states exactly the 3 tiers from `spec.md` section 8 (100% ≤ 7 days and no lesson started; 50% ≤ 7 days, lessons started, final exam not started; 0% after 7 days, or once the final exam has started, or a certificate was issued) and that requests go through the Portal.
- School rules match `spec.md` section 7 (8 sections in order, minimum time per lesson, identity checks, 25-question final, 70%, 2 attempts, 90 days access, no outside help, AI off during the exam).
- About: original copy for a demo multilingual school; say clearly it is a demo, not a licensed school.
- Accessibility statement: commitment, what the site does (keyboard, contrast, captions planned), how to ask for an accommodation (the form below).
- Leave one slug without a `ru` row (e.g. `school-rules`) so the fallback path is exercised and tested, with a SQL comment saying so.
- `changelog`: 4 entries × 4 languages with distinct `published_at` dates in 2026, plain past-tense notes about the demo's phases (e.g. "Public site opens", "Courts by county", "FAQ", "Support requests").
- Never write the school name, licence number, phone or email in `supabase/` (`scripts/check-conventions.ts`): say "the school"/"we"; the pages that need contact details take them from `siteConfig`.
- Non-English rows get a SQL comment that a native speaker must review them before launch.

## Interfaces

```ts
type PageRow = { locale: string; slug: string; title: string; body: string; updated_at: string };
getPage(slug: string, locale: Locale): Promise<TranslationResult<PageRow> | null>
listChangelog(locale: Locale): Promise<(TranslationResult<ChangelogRow> & { slug: string })[]>
<ContentPage result={TranslationResult<PageRow>}>{children}</ContentPage>
contentPageMetadata(slug: string, locale: Locale, path: string): Promise<Metadata>
```

## Test slices (in order)

1. DB `tests/db/pages.db.test.ts`: a Visitor reads the 6 published page slugs in `en`; an unpublished row (inserted with the service client, cleaned up) is invisible to a Visitor; same for `changelog`.
2. Unit for the Markdown-stripped description helper.
3. E2E `tests/e2e/legal-pages.spec.ts`: each of the 6 pages renders its H1 in `en` and in one other language (spread across ja/es/ru); legal pages show the demo line; `/ru/school-rules` shows the "not yet translated" notice, English text, canonical pointing to the English URL and no `ru` hreflang; `/about` shows the `siteConfig` email; axe clean on a couple of them.
4. E2E `tests/e2e/whats-new.spec.ts`: entries newest first with dates; `#slug` anchor exists; one other language; axe clean.

## Risks

- Brand values only via `siteConfig`, never in seed SQL.
- Refund policy wording must match the 100/50/0 table exactly (the refund function in phase 4 is tested against it).
- `/accessibility` is shared with ticket 06's ADA form: keep the form and its tests passing.
- Parallel tickets edit `sitemap-pages.ts` and `messages/*.json`: merge the integration tip and resolve.
