# 05: Blog

**What to build:** `/blog` and `/blog/[slug]` with 6 original posts in 3 categories in 4 languages, category filter, related posts, SVG covers and `Article` JSON-LD. See `.scratch/public-site/spec.md` (Database changes, Pages, SEO).

**Blocked by:** 01

**Status:** resolved

- [x] Migration: `posts.category` (`traffic-school`, `california-driving`, `after-your-ticket`); regenerate DB types
- [x] Seed 6 posts × 4 languages (2 per category), original copy, no third-party brands
- [x] One SVG cover per category in `public/placeholder/`, used on cards and as OG image
- [x] `/blog`: list newest first, category filter via `?category=`, no pagination
- [x] `/blog/[slug]`: category, date, Markdown body, up to 3 related posts (same category, newest); English fallback with notice; unknown slug → 404
- [x] `Article` + `BreadcrumbList` JSON-LD; metadata; posts in the sitemap with language alternates
- [x] E2E: list, filter and one post in en + one other; fallback case; axe clean
- [ ] `pnpm check:locked` passes

## Comments

- 2026-11-26: Resolved. Merged the WIP branch `worktree-agent-a804459721574d797` in 06444b1, resolving conflicts in `json-ld.ts`, its test and `sitemap-pages.ts`, and giving `posts` rows a category in `tests/db/data-access.db.test.ts`. Checked with `pnpm lint`, `pnpm typecheck`, `pnpm db:reset` and the unit tests in the pre-commit hook. `tests/db/posts.db.test.ts` and `tests/e2e/blog.spec.ts` were not run, so the `pnpm check:locked` box stays open.
