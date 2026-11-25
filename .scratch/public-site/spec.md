# Phase 2: Public site

Status: ready-for-agent

Source: phase 2 of the build plan in `spec.md`, refined by the phase 2 grilling session (2026-11-25). Vocabulary follows `GLOSSARY.md` (new this phase: Citation, County, Court, Courthouse, Support request, Translation, Sample review, Classroom waitlist, State waitlist). Decisions recorded in `docs/adr/0003-rate-limits-in-postgres.md` and `docs/adr/0004-translations-share-one-slug.md`.

## Problem Statement

Phase 1 left a working frame (header, footer, announcement bar, 404, auth, protected portal and admin) but no public pages: every nav link falls through to the 404 page. A driver with a Citation cannot learn what the school offers, check whether they are eligible, find their Court, read answers to common questions, or reach the school. Search engines have nothing to index and no structured data. The site must also stay honest: it is a demo, so nothing on it may claim a real licence, real customers or verified court data.

## Solution

Every public page from section 5 of `spec.md`, in all four UI languages, with content stored in the database where an Admin will edit it in phase 5, and in message files where it is fixed UI copy. Visitors can send Support requests (contact, "Got a problem?", ADA) and join the State waitlist and the Classroom waitlist, protected by rate limits and a honeypot. Every page has metadata, canonical and hreflang links, and JSON-LD; a sitemap and robots file exist, but the whole site stays `noindex` unless an env flag allows indexing.

## User Stories

### Visitor: finding out about the school

1. As a Visitor, I want a home page that shows the price, how the course works in 4 steps, the course card, popular Counties, pricing with the refund tiers, Sample reviews, an AI teaser, 4 short FAQs and a final call to action, so that I understand the offer in one scroll.
2. As a Visitor, I want the hero badge and trust row to say plainly that this is a demo school with licence `DEMO-0000`, so that I'm not misled.
3. As a Visitor, I want `/courses` to show the 4 course languages as cards and a course panel with features, price and a "Start in {language}" button, so that I can choose the language I'll study in.
4. As a Visitor, I want `/courses` to also show the 8-section syllabus, the rules, the reporting schedule, a refund summary and a Classroom waitlist card, so that I know what I'm buying.
5. As a Visitor, I want "Enroll Now" and "Start in {language}" to take me to sign-up with my chosen course language kept, so that I don't have to choose it again.
6. As a signed-in Student, I want the same buttons to take me to the Portal with my chosen course language, where I'm told payments arrive soon, so that the flow is ready for phase 4.
7. As a Visitor, I want to answer 5 yes/no questions on `/eligibility` and get a clear result with a next step, so that I know whether traffic school is an option for me.
8. As a Visitor, I want to pick the state my Citation is from, and see "Coming soon — notify me" for states other than California, so that I know whether the school serves me.
9. As a Visitor from another state, I want to leave my email to be told when my state opens, so that I can come back later.
10. As a Visitor, I want to leave my email and County for the in-person classroom, so that I hear when it opens.

### Visitor: courts

11. As a Visitor, I want `/courts` to show 4 popular County cards, a search box and the list of all 58 Counties with city, court code and "+N more courthouses", so that I can find my Court quickly.
12. As a Visitor, I want to search Counties by County name, city, Courthouse name or court code, with results as I type, so that I find mine even if I only know the city.
13. As a Visitor, I want a page per County at `/courts/<county>-county` listing its Courthouses with addresses and codes, how to ask for traffic school, deadlines, where to find my citation number, and a link to the Court's case lookup, so that I know what to do next.
14. As a Visitor, I want each County page to say that the court data is demo data and must be checked with the Court, so that I'm not misled by placeholders.

### Visitor: answers and reading

15. As a Visitor, I want `/faq` to show about 36 questions in 9 categories, a count line, a search box and popular search shortcuts (refund, final exam, certificate, password), so that I find an answer fast.
16. As a Visitor, I want a link to `/faq#<slug>` to open that exact answer, so that support and other pages can point me to it.
17. As a Visitor, I want a blog with posts in my UI language, category filters and related posts, so that I can read helpful articles.
18. As a Visitor, I want a page that has no version in my UI language to show the English text with a "not yet translated" notice, so that I still get the information.
19. As a Visitor, I want `/about`, `/terms`, `/privacy`, `/refund-policy`, `/school-rules` and the statement on `/accessibility` to show readable formatted text, so that I can check the school's terms.
20. As a Visitor, I want `/whats-new` to list changelog entries with date, title and text, so that I see what changed.
21. As a Visitor, I want `/dmv-services` to show scenario tiles (moving to CA, renewals, REAL ID, buying or selling a vehicle, replacing documents, checking status or paying) linking to official dmv.ca.gov pages, with search and a "not affiliated with the DMV" notice near the top, so that I find the right official page.

### Visitor: contacting the school

22. As a Visitor, I want a contact form on `/contact` (name, email, topic, message) that confirms it was sent and emails me a copy, so that I know the school got it.
23. As a Visitor, I want an ADA accommodation request form on `/accessibility` (name, email, optional phone, the help I need, how to contact me), so that I can ask for help with access.
24. As a Visitor, I want a "Got a problem?" link in the announcement bar that opens a form (what happened, page URL filled in, optional screenshot, email), so that I can report a bug from any page.
25. As a signed-in Student, I want my email prefilled and locked in the "Got a problem?" form, so that the school knows who I am.
26. As a Visitor, I want clear translated errors on every form, and a friendly message if I've sent too many in a short time, so that I know what to fix.

### Visitor: language and search engines

27. As a Visitor whose browser prefers another of the 4 languages, I want a banner offering this page in that language, never an automatic redirect, so that I stay in control.
28. As a Visitor, I want to dismiss that banner and not see it again for a year, so that it doesn't nag me.
29. As a Visitor arriving from a search engine or a shared link, I want a correct title, description and preview image, so that I know what the page is before opening it.

### Admin (data only; screens come in phase 5)

30. As an Admin, I want every Support request (contact, bug, ADA) stored with its type, email, body, page URL, attachment and form details, so that I can handle it in phase 5.
31. As an Admin, I want bug screenshots in a private bucket that no client can read, so that personal data on screenshots stays private.
32. As an Admin, I want the State waitlist and the Classroom waitlist stored separately, so that I can export each.
33. As an Admin, I want seeded reviews flagged as Sample reviews, so that I can tell them from real ones.

### Developer

34. As a developer, I want one helper that builds page metadata (title, description, canonical, hreflang for 4 languages plus `x-default`, Open Graph, Twitter, robots), so that every page is consistent.
35. As a developer, I want one content lookup that returns the requested Translation or the English one with a fallback flag, so that every content page handles gaps the same way.
36. As a developer, I want one rate-limit function in Postgres that every public form calls, so that later phases reuse it for auth, AI and exam limits.
37. As a developer, I want an email sender that uses Mailpit locally and Resend when `RESEND_API_KEY` is set, so that E2E tests can read sent mail.

## Implementation Decisions

### Rendering and caching

- Public pages render per request (the phase 1 frame reads cookies and the session). Database reads for content are cached with `unstable_cache` (via `cachedContent` in `src/lib/content/cache.ts`; `"use cache"` needs `cacheComponents`, which option (a) rules out) and tagged per content type (`courts`, `faq`, `pages`, `posts`, `changelog`, `reviews`, `courses`), so phase 5 admin edits call `revalidateTag`. No page needs the database at build time.
- `TODO(spec):` if Lighthouse mobile falls below 90, move to Next 16 `cacheComponents` with the announcement bar and account menu inside `<Suspense>`.

### Translations (ADR 0004)

- Rows with the same slug across languages are Translations of one item; slugs are English in every language.
- When the requested language has no published row, show the English row with a "Not yet translated" notice; the canonical URL points to the English page.
- hreflang lists only languages that have a published row (plus `x-default` → English).

### Content format and location

- Admin-editable bodies (`pages`, `posts`, `faq_items`, `changelog`, `counties.instructions`) are Markdown, rendered on the server with `react-markdown`, raw HTML disabled, links to other sites open with `rel="noopener noreferrer"`.
- Database (editable in phase 5): FAQ, legal pages (`terms`, `privacy`, `refund-policy`, `school-rules`), the `about` body, the `accessibility` statement, blog posts, changelog, reviews, Counties and Courthouses, prices (`courses` rows; the classroom is a `courses` row with `active = false`).
- Messages (fixed UI copy): home section copy, eligibility questions and results, DMV-services tiles, form labels and errors, the County page template, 404.
- Claude writes all content in English and translates it into ja, es and ru; non-English content carries the existing note that a native speaker must review it before launch. Legal pages start with a "Demo text, not legal advice" line.
- Content is seeded from files under `supabase/seed/` (one per content type) that `seed.sql` includes, not from migrations.

### Honesty rules for a demo

- Hero badge: "Demo traffic school · License {licenseNumber}". Trust row: "Self-paced in 4 languages · 90 days of access · Secure Stripe payments". The `/courses` feature "DMV-licensed" becomes "Built to DMV course rules (demo)".
- Reviews: all seeded reviews have `is_sample = true`; the carousel shows a visible "Sample reviews" label. `AggregateRating` JSON-LD is built only from non-sample reviews, so none exists for now.
- County pages carry "Demo data — check with your court" near the top. Courthouse addresses and court codes are placeholders marked `TODO(spec):`; County names and county-seat cities are real; case-lookup URLs point to the real official superior-court site only where easily confirmed, otherwise null.
- Indexing is off by default: `robots.txt` disallows all and every page has `noindex` unless `SITE_INDEXABLE=true`. Sitemap, hreflang and JSON-LD are still produced and tested.

### Database changes (forward-only migrations)

- `counties`: `state_code`, `name`, `slug` (unique, ends in `-county`), `popular_rank` (nullable, unique), `case_lookup_url`, `instructions jsonb` (per-language Markdown addendum, empty in the seed). Public read. `courts` gains `county_id` (fk, not null after backfill); a `courts` row is a Courthouse. `enrollments.court_id` keeps pointing at a Courthouse.
- `faq_items`: `category` (check against `about`, `course`, `exam`, `certificates`, `payments`, `eligibility`, `language`, `ai`, `classroom`, `contact`), `featured boolean not null default false`. `TODO(spec):` `spec.md` says "9 categories" but lists 10 groups; all 10 are used.
- `posts`: `category` (check: `traffic-school`, `california-driving`, `after-your-ticket`).
- `reviews`: `is_sample boolean not null default true`.
- `tickets`: `page_url text`, `attachment_path text`, `details jsonb not null default '{}'`. Visitors and Students may insert only through server actions; no client reads.
- `classroom_waitlist`: `email`, `county_id`, `locale`. Insert via server action; Admin read.
- `rate_limits` plus a `security definer` function `hit_rate_limit(key text, max int, window_seconds int) returns boolean` (ADR 0003). Old rows pruned on write.
- Storage: private bucket `support-attachments`; no client policies; the server action uploads with the service role. Images only (png, jpeg, webp), max 5 MB.
- Seed: all 50 states plus DC in `states` (CA active, the rest inactive), the 58 Counties with their Courthouses, 14 popular Counties ranked by population (Los Angeles, San Diego, Orange, Riverside, San Bernardino, Santa Clara, Alameda, Sacramento, Contra Costa, Fresno, Kern, San Francisco, Ventura, San Mateo).

### Forms and Support requests

- Every public form: shared Zod schema (client and server), a hidden honeypot field (a filled honeypot returns fake success), `hit_rate_limit` per IP per form (5 per 10 minutes) before any work.
- Contact: name, email, topic (`general`, `course`, `payment`, `technical`), message → `tickets` type `contact` + confirmation email to the sender + notification to `siteConfig.contact.email`.
- ADA: name, email, optional phone, need, preferred contact (`email`, `phone`) → `tickets` type `ada` + confirmation + notification.
- Got a problem?: modal opened from the announcement bar link (and the footer if the bar is dismissed or absent); fields: what happened, page URL (auto, read-only), optional screenshot, email (prefilled and read-only when signed in) → `tickets` type `bug`, no confirmation email.
- State waitlist ("notify me"): email only → `state_waitlist`. Classroom waitlist: email + County → `classroom_waitlist`. No emails.
- Email: an `EmailSender` interface in `src/lib/email/`; the SMTP implementation sends to local Mailpit, the Resend implementation is used when `RESEND_API_KEY` is set. Phase 2 templates are plain English. `TODO(spec):` React Email templates in 4 languages in phase 4.

### Pages

- Home: sections in the order of `spec.md` 5.1. Prices come from the `courses` table (save amount = list minus price). The reviews carousel has no autoplay and works by keyboard. The AI teaser's CTA shows a "Coming soon" state; the floating AI widget is not built.
- Courses: language cards (flag, native name, "Original course" under English, "LIVE" badge, selected state with check); the selected course language lives in the URL (`?course=ja`). Buttons go to `/signup?course=<lang>` for Visitors, `/portal?course=<lang>` for signed-in Students; the Portal shows "Payments arrive soon".
- Eligibility: 5 yes/no questions from `spec.md`; the logic is a pure function in `src/config/states/ca.ts`; any "no" gives a result naming the blocking answer and a next step (ask your Court / not eligible); all "yes" gives "You're likely eligible" + enroll CTA. Nothing is stored.
- Citation-state selector: a compact chip in the home hero and on `/courses`; options are the 51 `states` rows; choice saved in cookie `ticket_state`; inactive states show "Coming soon — notify me" with the State waitlist form.
- Courts list: 4 cards for `popular_rank` 1–4 with original SVG art; client-side search over County name, city, Courthouse name and court code; without JavaScript the full list shows.
- County page: route `/courts/[slug]`; shared template from messages filled with County data, then the optional Markdown addendum; CTA to `/courses`.
- FAQ: grouped by category with accordions; client-side search over title and body; popular tags are preset search terms; `#slug` opens and scrolls to the item. Home shows the 4 `featured` items.
- Blog: list with category filter (`/blog?category=…`), no pagination; post page shows category, date, body and up to 3 related posts (newest, same category); each category has an SVG cover used as OG image.
- What's new: published `changelog` rows, newest first, each with an anchor.
- DMV services: tiles from messages, each with an official dmv.ca.gov URL; client-side search over title and keywords.
- Language suggestion banner: client component; compares `navigator.languages` to the URL's UI language; shows when a different supported language is the best match and cookie `lang_banner_dismissed` is unset; links to the same path in that language; dismissal cookie lasts 1 year.

### SEO

- `buildMetadata({ locale, path, title, description, image?, availableLocales? })`: canonical (English canonical when falling back), hreflang for available languages plus `x-default`, Open Graph, Twitter card, robots (`noindex` unless `SITE_INDEXABLE=true`).
- `sitemap.xml`: every static public page in 4 languages, every County page, every published post per language (with alternates).
- JSON-LD: `EducationalOrganization` (home), `Course` with `offers` (home, courses), `FAQPage` (faq), `BreadcrumbList` (county pages, blog posts), `Article` (blog posts).
- Every image has alt text; decorative SVGs use `alt=""` / `aria-hidden`.

### Images

- Original SVG illustrations in `public/placeholder/`: hero road landscape, device mockup, County card art, 3 blog category covers, default OG image. The hero image has fixed dimensions and is preloaded.

## Testing Decisions

- Same seams and rules as phase 1: test external behaviour against the real local stack, nothing mocked.
- E2E (Playwright), per page: renders in `en` and one other UI language, key interactions work, axe finds no critical issues. Mobile project (375 px): every form and the FAQ and courts search.
- E2E for forms: success state, translated validation error, honeypot fake success, rate-limit message after the limit, contact and ADA confirmation emails read from Mailpit.
- E2E for SEO: canonical and hreflang on a page with all Translations and on a fallback page; `noindex` present by default; `sitemap.xml` and `robots.txt` respond.
- E2E for the language banner: shown for a browser locale of `ru` on `/faq`, never redirects, stays hidden after dismissal.
- DB tests: `hit_rate_limit` allows then blocks within a window and resets after it; Visitors and Students cannot read `tickets`, `classroom_waitlist` or `state_waitlist`; no client can read or write the `support-attachments` bucket; `counties` and `courts` readable by a Visitor; unpublished content invisible to clients.
- Unit tests: translation fallback lookup, Markdown rendering strips raw HTML, eligibility result logic, metadata builder (canonical, hreflang, robots), Zod schemas of each form.
- Every ticket passes `pnpm check:locked` before it counts as done.

## Out of Scope

- Admin screens to edit any of this content, reindexing caches from the UI: phase 5.
- Checkout, payment, verified-email gate before checkout, `/verify/[certNo]`: phase 4.
- Driver details form and its "Where do I find this?" sample-ticket helper: phase 3.
- The floating AI widget, the AI side panel and the tour video: phase 6.
- Translated React Email templates: phase 4.
- Partial prerendering (`cacheComponents`), unless Lighthouse requires it.
- Real, verified courthouse addresses and court codes.

## Further Notes

- `spec.md` remains the source of truth for everything not decided here.
- Tickets live in `.scratch/public-site/issues/`. Ticket 01 goes first; after it, 02, 03, 04, 05, 06 and 08 are independent; 07 needs 04 and 06; 09 needs 03, 04 and 07. At most 2 run in parallel (ADR 0002).
