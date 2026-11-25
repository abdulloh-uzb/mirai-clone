# 03: FAQ

**What to build:** `/faq` with about 36 questions across the FAQ categories, a count line, client-side search, popular search shortcuts and `#slug` deep links, plus `FAQPage` JSON-LD. See `.scratch/public-site/spec.md` (Database changes, Pages, SEO).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Migration: `faq_items.category` (checked key list, 10 groups — see spec `TODO(spec)`), `faq_items.featured`; regenerate DB types
- [ ] Seed ~36 original Q&A × 4 languages; exactly 4 `featured`; answers are consistent with `spec.md` (25 questions, 70%, 2 attempts, 90 days, refund tiers, 3 report batches a day)
- [ ] Page: H1 "Find an answer", count line, search over title and body (full list without JavaScript), popular shortcuts (refund, final exam, certificate, password), accordions grouped by category, `#slug` opens and scrolls to the item
- [ ] `FAQPage` JSON-LD; metadata; sitemap entry
- [ ] E2E: renders in en + one other; search filters; deep link opens the item; mobile search; axe clean. DB: unpublished items invisible to Visitors
- [ ] `pnpm check:locked` passes
