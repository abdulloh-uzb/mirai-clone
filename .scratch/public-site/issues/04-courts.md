# 04: Courts

**What to build:** Counties as their own table, all 58 California Counties with their Courthouses seeded, the `/courts` list with popular cards and search, and one page per County. See `.scratch/public-site/spec.md` (Database changes, Honesty rules, Pages) and `GLOSSARY.md` (County, Court, Courthouse).

**Blocked by:** 01

**Status:** ready-for-agent

- [x] Migration: `counties` table (public read), `courts.county_id` fk, backfill then not null; regenerate DB types
- [x] Seed: 58 Counties with real names and county-seat cities; slugs end in `-county`; 14 `popular_rank` values in the order given in the spec; at least one Courthouse per County, several for large ones; placeholder addresses and court codes marked `TODO(spec)`; real official case-lookup URLs only where easily confirmed, else null
- [x] `/courts`: H1, 4 popular cards (original SVG art), search over County, city, Courthouse name and court code, full County list (name, city, court code, "+N more courthouses")
- [x] `/courts/[slug]`: "Demo data — check with your court" notice, Courthouses, shared instructions template from messages, optional Markdown addendum, case-lookup link, CTA to `/courses`; unknown slug → 404
- [x] `BreadcrumbList` JSON-LD; metadata; County pages in the sitemap
- [x] E2E: list and one County page in en + one other; search by city and by court code; mobile search; axe clean. DB: Visitor reads `counties` and `courts`
- [x] `pnpm check:locked` passes
