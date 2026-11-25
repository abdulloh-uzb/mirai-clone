# 01: Content foundations

**What to build:** The shared pieces every public page uses: Markdown rendering, Translation lookup with English fallback, cached content reads, the metadata builder, `robots.txt`, `sitemap.xml` and the language suggestion banner. Prove them on one real page so the patterns are exercised end to end. See `.scratch/public-site/spec.md` (Rendering and caching, Translations, Content format, SEO).

**Blocked by:** none

**Status:** resolved

- [x] Markdown renderer (server, `react-markdown`, raw HTML disabled, external links `rel="noopener noreferrer"`)
- [x] Content lookup: returns the published row in the requested UI language, or the English row with a fallback flag; "Not yet translated" notice component
- [x] Cached reads with `unstable_cache` + tags (`"use cache"` needs cacheComponents)
- [x] `buildMetadata` helper: title, description, canonical (English when falling back), hreflang for available languages + `x-default`, Open Graph, Twitter, robots `noindex` unless `SITE_INDEXABLE=true` (add to `.env.example` and `src/lib/env.ts`)
- [x] `robots.txt` (disallow all unless indexable) and `sitemap.xml` built from a registry that later tickets add to (static pages × 4 languages for now)
- [x] Default OG image SVG in `public/placeholder/`
- [x] Language suggestion banner: client-side from `navigator.languages`, never redirects, same path in the suggested language, dismissal cookie for 1 year
- [x] Apply `buildMetadata` to the existing home placeholder and 404
- [x] Unit: fallback lookup, Markdown strips raw HTML, metadata builder. E2E: banner shown for `ru` browser on `/faq`-like path and hidden after dismissal; `noindex` by default; `robots.txt` and `sitemap.xml` respond
- [x] `pnpm check:locked` passes

## Comments

- 2026-11-25: Resolved. Landed on `public-site` in 00a980e via `scripts/merge-ticket.sh` (unit 85, db 69, e2e 45). Notes: `unstable_cache` replaces `"use cache"` (needs cacheComponents); the 404 relies on Next's automatic noindex; the new axe helper found a label/name mismatch on the phase 1 logo link and language switcher, fixed here.
