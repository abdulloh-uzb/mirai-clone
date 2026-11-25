# 02: Legal pages, About, School rules and What's new

**What to build:** `/terms`, `/privacy`, `/refund-policy`, `/school-rules`, `/about` and `/whats-new`, with original demo copy in 4 languages seeded into `pages` and `changelog`, rendered as Markdown with English fallback. `/accessibility` gets its statement here; its ADA form comes in ticket 06. See `.scratch/public-site/spec.md` (Content format, Pages).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Seed files under `supabase/seed/` for `pages` (terms, privacy, refund-policy, school-rules, about, accessibility) and `changelog` (3–5 entries) in en/ja/es/ru; legal pages start with "Demo text, not legal advice"; refund policy matches the 100/50/0 table in `spec.md` section 8
- [ ] One page route per slug reading `pages`; `/about` adds contact details from `siteConfig`
- [ ] `/whats-new`: newest first, date, title, Markdown body, anchor per entry
- [ ] Metadata on each page; pages added to the sitemap registry
- [ ] E2E: each page renders in en + one other language; a fallback case shows the notice and English canonical; axe clean
- [ ] `pnpm check:locked` passes
