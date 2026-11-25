# 05: Blog

**What to build:** `/blog` and `/blog/[slug]` with 6 original posts in 3 categories in 4 languages, category filter, related posts, SVG covers and `Article` JSON-LD. See `.scratch/public-site/spec.md` (Database changes, Pages, SEO).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Migration: `posts.category` (`traffic-school`, `california-driving`, `after-your-ticket`); regenerate DB types
- [ ] Seed 6 posts × 4 languages (2 per category), original copy, no third-party brands
- [ ] One SVG cover per category in `public/placeholder/`, used on cards and as OG image
- [ ] `/blog`: list newest first, category filter via `?category=`, no pagination
- [ ] `/blog/[slug]`: category, date, Markdown body, up to 3 related posts (same category, newest); English fallback with notice; unknown slug → 404
- [ ] `Article` + `BreadcrumbList` JSON-LD; metadata; posts in the sitemap with language alternates
- [ ] E2E: list, filter and one post in en + one other; fallback case; axe clean
- [ ] `pnpm check:locked` passes
