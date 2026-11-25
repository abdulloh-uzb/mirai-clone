# Plan 08: DMV services

**Goal:** build `.scratch/public-site/issues/08-dmv-services.md`: `/dmv-services`, ~20 scenario tiles in 6 groups linking to official dmv.ca.gov pages, with client-side search and a "not affiliated with the DMV" notice near the top. All copy in messages.

## Files

- `src/config/dmv-services.ts` (new, pure): the tile structure that doesn't change per language: `DMV_SERVICE_GROUPS` = ordered groups (`moving`, `renewals`, `real-id`, `vehicles`, `replace`, `status-pay`), each with tile ids and their official URL. Copy (title, text, keywords) lives in messages under `DmvServices.tiles.<id>`; keys must match the ids (unit test).
  - URLs must be on `https://www.dmv.ca.gov/`. Use only pages you are confident exist (e.g. the portal home `https://www.dmv.ca.gov/portal/`, REAL ID `https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/`, driver licence renewal, vehicle registration renewal, change of address, new-resident pages). Where unsure, point at the closest section page you are sure of rather than guessing a deep path, and leave `// TODO(spec): confirm deep link`. The DMV site itself is not the school's brand, so naming the DMV is fine; no DMV logo.
- `src/lib/dmv-services/search.ts` (new, pure): `matchesTile({ title, keywords }, query)` — case/accent-insensitive substring over title and keywords.
- `src/components/dmv-services/tile-search.tsx` (client): labelled search input, live count (`aria-live="polite"`), "No services match"; hides non-matching tiles (`data-search` attribute) and empty groups. Server renders the full list, so it works without JS.
- `src/app/[locale]/dmv-services/page.tsx` (new): H1, intro, the notice right after the H1 (`role="note"`: not affiliated with or endorsed by the California DMV; links go to the official site), search, groups (`h2`) with tiles: title, short text, link "Open on dmv.ca.gov" with `target="_blank" rel="noopener noreferrer"` and visually hidden "(opens in a new tab)" text, external-link icon `aria-hidden`. Metadata; add `{ path: "/dmv-services" }` to `src/lib/seo/sitemap-pages.ts`.
- `messages/{en,ja,es,ru}.json`: `DmvServices` namespace (H1, intro, notice, search label/placeholder, count, no results, opens-in-new-tab text, group labels, ~20 tiles × {title, text, keywords}, metadata). Keywords per language (synonyms the visitor might type, e.g. "license", "licence", "DL").

## Data

None.

## Interfaces

```ts
type DmvServiceGroup = { id: string; tiles: { id: string; url: string }[] };
DMV_SERVICE_GROUPS: readonly DmvServiceGroup[]
matchesTile(tile: { title: string; keywords: string }, query: string): boolean
```

## Test slices (in order)

1. Unit `src/config/dmv-services.test.ts`: every URL starts with `https://www.dmv.ca.gov/`; ids unique; every tile id has title/text/keywords in all 4 message files; ~20 tiles across 6 groups.
2. Unit `src/lib/dmv-services/search.test.ts`.
3. E2E `tests/e2e/dmv-services.spec.ts`: `/dmv-services` and `/ru/dmv-services` render H1, the notice before the first tile, ~20 tiles; searching "REAL ID" (and a Russian keyword on `/ru`) narrows the list; links have `target=_blank`, `rel` with `noopener`, and an accessible name containing the new-tab text; axe clean.
4. E2E `tests/e2e/dmv-services.mobile.spec.ts`: search at 375 px.

## Risks

- No invented URLs presented as official: prefer a sure section page over a guessed deep link.
- Notice must be near the top (before the tiles).
- Message key parity; parallel tickets edit `messages/*.json` and `sitemap-pages.ts`: merge the integration tip and resolve.
