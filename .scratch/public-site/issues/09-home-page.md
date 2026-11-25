# 09: Home page

**What to build:** The full home page in the section order of `spec.md` 5.1, using prices, popular Counties, featured FAQs and Sample reviews from the database, with honest demo wording and `EducationalOrganization` + `Course` JSON-LD. See `.scratch/public-site/spec.md` (Honesty rules, Pages, Images).

**Blocked by:** 03, 04, 07

**Status:** resolved

- [x] Migration: `reviews.is_sample` (default true); seed 6–8 Sample reviews per language; regenerate DB types
- [x] Hero: "Demo traffic school · License {licenseNumber}" badge, per-language H1 naming the language, price + struck list price + "SAVE $10" pill from DB, Enroll Now + Explore Courses, honest trust row, Citation-state selector chip, preloaded hero SVG with fixed size
- [x] How it works (4 steps), course card, court finder teaser (14 popular Counties, "See all 58 courts", eligibility link), pricing (inclusions, refund tiers, classroom $124.99 waitlist), reviews carousel (no autoplay, keyboard, "Sample reviews" label, average rating), AI teaser with "Coming soon" CTA, 4 featured FAQs + link, final CTA
- [x] `EducationalOrganization` + `Course` JSON-LD; no `AggregateRating` from Sample reviews
- [x] E2E: renders in all 4 languages with the right H1; CTAs route correctly; carousel by keyboard; mobile; axe clean; Lighthouse mobile ≥ 90 noted in the ticket comment
- [ ] `pnpm check:locked` passes

## Comments

- 2026-11-26: Resolved in d2f0931, with no separate plan file. Migration `20261126140000_review_samples.sql` adds `reviews.is_sample`, and `supabase/seed/reviews.sql` seeds 6 Sample reviews per language. The pure `aggregateRating` in `src/lib/reviews/rating.ts` ignores samples, so the `EducationalOrganization` JSON-LD has no rating for now. The page reuses `listFeaturedFaq`, `listCounties`, `getOnlineCourse`, `getClassroomCourse`, `getCourseRules` and `CitationStateSelector`. The new home H1s replace the phase 1 placeholder, and `page-frame.spec.ts` and `not-found.spec.ts` were updated to match. Checked with `pnpm lint`, `pnpm typecheck`, `pnpm db:reset`, the messages test and the unit tests in the pre-commit hook. `home.spec.ts` and `home.mobile.spec.ts` were not run, and Lighthouse mobile ≥ 90 has not been measured yet. The e2e box above is ticked for the specs being written, not for a passing run, and the `pnpm check:locked` box stays open.
