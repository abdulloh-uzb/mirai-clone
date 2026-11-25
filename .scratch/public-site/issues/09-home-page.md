# 09: Home page

**What to build:** The full home page in the section order of `spec.md` 5.1, using prices, popular Counties, featured FAQs and Sample reviews from the database, with honest demo wording and `EducationalOrganization` + `Course` JSON-LD. See `.scratch/public-site/spec.md` (Honesty rules, Pages, Images).

**Blocked by:** 03, 04, 07

**Status:** ready-for-agent

- [ ] Migration: `reviews.is_sample` (default true); seed 6–8 Sample reviews per language; regenerate DB types
- [ ] Hero: "Demo traffic school · License {licenseNumber}" badge, per-language H1 naming the language, price + struck list price + "SAVE $10" pill from DB, Enroll Now + Explore Courses, honest trust row, Citation-state selector chip, preloaded hero SVG with fixed size
- [ ] How it works (4 steps), course card, court finder teaser (14 popular Counties, "See all 58 courts", eligibility link), pricing (inclusions, refund tiers, classroom $124.99 waitlist), reviews carousel (no autoplay, keyboard, "Sample reviews" label, average rating), AI teaser with "Coming soon" CTA, 4 featured FAQs + link, final CTA
- [ ] `EducationalOrganization` + `Course` JSON-LD; no `AggregateRating` from Sample reviews
- [ ] E2E: renders in all 4 languages with the right H1; CTAs route correctly; carousel by keyboard; mobile; axe clean; Lighthouse mobile ≥ 90 noted in the ticket comment
- [ ] `pnpm check:locked` passes
