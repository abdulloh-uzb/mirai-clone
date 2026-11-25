# Plan 04: Courts

**Goal:** build `.scratch/public-site/issues/04-courts.md`: a `counties` table with all 58 California Counties and their Courthouses, the `/courts` list with popular cards and search, and `/courts/[slug]` County pages.

## Files

- `supabase/migrations/<ts>_counties.sql` (new, via `pnpm db:new counties`): see Data.
- `supabase/config.toml`: `[db.seed] sql_paths = ["./seed.sql", "./seed/*.sql"]`. This is the seed-file mechanism every later ticket uses (the CLI loads seed files with its own driver, so psql `\i` does not work). Files load in name order after `seed.sql`, which already seeds `CA`.
- `supabase/seed/courts.sql` (new): 58 Counties + Courthouses (see Data).
- `src/lib/database.types.ts`: regenerate with `pnpm db:types`.
- `src/lib/courts/counties.ts` (new, server): cached reads (`cachedContent`, tag `contentTags.courts`):
  - `listCounties(): Promise<CountySummary[]>` — every CA County ordered by name, each with its Courthouses (name, city, court_code) via an embedded select; `popular_rank`.
  - `getCountyBySlug(slug): Promise<CountyDetail | null>` — County + Courthouses (name, address, city, court_code) + `case_lookup_url` + `instructions`.
  - Read with `createAnonClient()` (`src/lib/supabase/anon.ts`), RLS applies.
- `src/lib/courts/search.ts` (new, pure): `matchesCountyQuery(county, query): boolean` — case- and accent-insensitive substring match over County name, county-seat city, every Courthouse name and court code. Unit-tested.
- `src/components/courts/county-search.tsx` (new, client): search input (label from messages) + result count `aria-live="polite"`; the server renders the full list as children/props; the client hides non-matching rows. Without JavaScript the full list shows (render all rows server-side; filter only after hydration).
- `src/components/courts/county-card.tsx` (new): popular card with `public/placeholder/county-card.svg` (`alt=""`, decorative), County name, city, link to the County page.
- `public/placeholder/county-card.svg` (new): original SVG art (hills, road, courthouse silhouette). No real logos or photos.
- `src/app/[locale]/courts/page.tsx` (new): H1, 4 popular cards (`popular_rank` 1–4), `CountySearch`, full list rows: County name (link), city, first Courthouse's court code, "+N more courthouses" (ICU plural; omit when N = 0). `generateMetadata` with `pageMetadata` (`src/lib/seo/page-metadata.ts`).
- `src/app/[locale]/courts/[slug]/page.tsx` (new): unknown slug → `notFound()`. Top: notice "Demo data — check with your court" (`role="note"`). H1 "{County} County Superior Court" (or similar, from messages). Courthouses list (name, address, court code). Shared instructions template from messages (how to ask for traffic school, deadlines, where to find the citation number), filled with the County name. Then the Markdown addendum `instructions[locale] ?? instructions.en` rendered with the existing `Markdown` component (`src/components/content/markdown.tsx`), only when non-empty. Case-lookup link only when `case_lookup_url` is set (opens in new tab, accessible "opens in a new tab" text). CTA link to `/courses`. Breadcrumb JSON-LD. `generateMetadata` (title/description from messages filled with County name).
- `src/lib/seo/json-ld.ts` (new, pure): `breadcrumbList(siteUrl, locale, items: {name, path}[])` returning a schema.org object, using `localizedUrl` from `src/lib/seo/metadata.ts`. Later tickets add `faqPage`, `article`, `course`, `educationalOrganization` here, so keep it a plain module of builders.
- `src/components/seo/json-ld.tsx` (new, server): `<JsonLd data={...} />` rendering `<script type="application/ld+json">` with `JSON.stringify(data).replace(/</g, "\\u003c")`.
- `src/lib/seo/sitemap-pages.ts`: add `{ path: "/courts" }` to `staticSitemapPages`; add a reader to `dynamicSitemapSources` that returns `/courts/<slug>` for every County (all 4 languages: the template is in messages).
- `messages/{en,ja,es,ru}.json`: new namespaces `Courts` (list page) and `County` (County page template, notice, metadata). Fixed UI copy, so it lives here, not in the DB.

## Data

Migration `counties`:
- `public.counties`: `id uuid pk default gen_random_uuid()`, `state_code text not null references states(code) on update cascade`, `name text not null` (e.g. `Los Angeles`, without "County"), `slug text not null unique check (slug ~ '^[a-z0-9-]+-county$')`, `seat_city text not null`, `popular_rank integer unique check (popular_rank > 0)` (nullable), `case_lookup_url text`, `instructions jsonb not null default '{}' check (jsonb_typeof(instructions) = 'object')`, `created_at`, `updated_at`, `unique (state_code, name)`. RLS on; policy "counties: anyone reads" for select to anon, authenticated using (true). `set_updated_at` trigger like the other tables.
- `public.courts`: add `county_id uuid references counties(id) on delete restrict`; no rows exist yet, so backfill is a no-op `update`, then `alter column county_id set not null`; index on `county_id`. Drop the old free-text `courts.county` column (nothing reads it; `grep` first to confirm). Keep the other `courts` columns (`citation_regex` etc. are used in phase 3).
- `seed_city` naming: the spec calls it "city"; `seat_city` is the County's county-seat city shown in the list.

Seed `supabase/seed/courts.sql`:
- All 58 CA Counties with real names and real county-seat cities. Slug: kebab-case name + `-county` (`los-angeles-county`, `san-luis-obispo-county`).
- `popular_rank` 1–14 in this exact order: Los Angeles, San Diego, Orange, Riverside, San Bernardino, Santa Clara, Alameda, Sacramento, Contra Costa, Fresno, Kern, San Francisco, Ventura, San Mateo. All others null.
- Courthouses (`courts` rows): at least 1 per County, 2–4 for the 14 popular ones. Names like "{City} Courthouse"; cities should be real cities in that County. Addresses and court codes are placeholders (e.g. address `"100 Placeholder Street, {City}, CA"`, code `"<2–3 letter county abbrev>-<NN>"`, unique), with a `-- TODO(spec): placeholder addresses and court codes; real ones need verifying with each Court` comment at the top. Courthouse slugs unique: `<county-slug>-<city-slug>`.
- `case_lookup_url`: null for every County, with `-- TODO(spec): add official case-lookup URLs once verified`. Do not guess URLs. The page simply hides the link when null.
- `instructions`: `'{}'` for all (addendum is optional; admin fills it in phase 5).

## Interfaces

```ts
type CourthouseSummary = { name: string; city: string | null; courtCode: string | null };
type CountySummary = { slug: string; name: string; seatCity: string; popularRank: number | null; courthouses: CourthouseSummary[] };
type CountyDetail = CountySummary & { caseLookupUrl: string | null; instructions: Partial<Record<Locale, string>>; courthouses: (CourthouseSummary & { address: string | null })[] };
listCounties(): Promise<CountySummary[]>
getCountyBySlug(slug: string): Promise<CountyDetail | null>
matchesCountyQuery(county: CountySummary, query: string): boolean
breadcrumbList(siteUrl: string, locale: Locale, items: { name: string; path: string }[]): object
<JsonLd data={object} />
```
Reuse: `cachedContent`/`contentTags` (`src/lib/content/cache.ts`), `pageMetadata` (`src/lib/seo/page-metadata.ts`), `localizedUrl` (`src/lib/seo/metadata.ts`), `Markdown` (`src/components/content/markdown.tsx`), `Link` from `@/i18n/navigation`, `publicEnv.NEXT_PUBLIC_SITE_URL`.

## Test slices (in order)

1. DB `tests/db/courts.db.test.ts`: a Visitor reads `counties` (58 CA rows, 14 with `popular_rank`, rank 1 = Los Angeles) and `courts` joined to counties; every County has ≥ 1 Courthouse; a Visitor cannot insert into `counties`.
2. Unit `src/lib/courts/search.test.ts`: matches by County name, city, Courthouse name, court code; case/accent-insensitive; empty query matches all.
3. Unit `src/lib/seo/json-ld.test.ts`: `breadcrumbList` positions and localized URLs.
4. E2E `tests/e2e/courts.spec.ts`: `/courts` in en and `/es/courts` render H1, 4 popular cards, 58 rows; search by a city (e.g. a county seat) narrows to that County; search by a seeded court code narrows; County page `/courts/los-angeles-county` and `/ja/courts/...` show the demo notice, Courthouses, CTA to `/courses`, BreadcrumbList JSON-LD; `/courts/nowhere-county` → 404; axe clean on both pages.
5. E2E `tests/e2e/courts.mobile.spec.ts`: search works at 375 px.
6. Unit (existing sitemap test or new): sitemap includes `/courts` and a County page.

## Risks

- Honesty: never present placeholder addresses/codes as real; the demo notice sits near the top of every County page. No real court logos.
- Brand values (`siteConfig` name, licence, email, phone) must not appear in `supabase/` or `messages/` (`scripts/check-conventions.ts` scans them).
- Translations of the messages in ja/es/ru must have the same keys as en (`tests/unit/messages.test.ts`).
- Search must not depend on JS for the full list (render all rows on the server).
- Ticket 07 (Classroom waitlist) and 09 (home teaser) read `listCounties()`: keep it exported and stable.
- Ticket 06 runs in parallel and also edits `supabase/config.toml` (storage) and `messages/*.json`; expect small merge conflicts when merging the integration tip.
