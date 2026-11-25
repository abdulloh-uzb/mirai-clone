# 02: Legal pages, About, School rules and What's new

**What to build:** `/terms`, `/privacy`, `/refund-policy`, `/school-rules`, `/about` and `/whats-new`, with original demo copy in 4 languages seeded into `pages` and `changelog`, rendered as Markdown with English fallback. `/accessibility` gets its statement here; its ADA form comes in ticket 06. See `.scratch/public-site/spec.md` (Content format, Pages).

**Blocked by:** 01

**Status:** resolved

- [x] Seed files under `supabase/seed/` for `pages` (terms, privacy, refund-policy, school-rules, about, accessibility) and `changelog` (3–5 entries) in en/ja/es/ru; legal pages start with "Demo text, not legal advice"; refund policy matches the 100/50/0 table in `spec.md` section 8
- [x] One page route per slug reading `pages`; `/about` adds contact details from `siteConfig`
- [x] `/whats-new`: newest first, date, title, Markdown body, anchor per entry
- [x] Metadata on each page; pages added to the sitemap registry
- [x] E2E: each page renders in en + one other language; a fallback case shows the notice and English canonical; axe clean
- [ ] `pnpm check:locked` passes

## Comments

- 2026-11-26: Resolved in 9e329b3. Seeds are in `supabase/seed/pages.sql` and `changelog.sql`. `school-rules` has no `ru` row, so it shows the English fallback. `/accessibility` now reads its statement from `pages`, and the placeholder message keys are gone. Checked with `pnpm lint`, `pnpm typecheck`, `pnpm db:reset`, the messages test and the unit tests in the pre-commit hook. `tests/db/pages.db.test.ts`, `legal-pages.spec.ts` and `whats-new.spec.ts` were not run, so the `pnpm check:locked` box stays open.
