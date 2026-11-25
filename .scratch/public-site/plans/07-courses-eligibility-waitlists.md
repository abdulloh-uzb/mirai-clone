# Plan 07: Courses, eligibility, Citation-state selector and waitlists

**Goal:** build `.scratch/public-site/issues/07-courses-eligibility-waitlists.md`: `/courses` (language cards, course panel, syllabus and the rest), buy buttons that keep the chosen Course language, `/eligibility`, the Citation-state selector chip with the State waitlist, and the Classroom waitlist.

Builds on ticket 04 (`listCounties()` in `src/lib/courts/counties.ts`) and ticket 06 (`runPublicForm`/`clientIp` in `src/lib/forms/public-form.ts`, form parts and `usePublicForm` in `src/components/forms/parts.tsx`, `Forms.errors` messages). Read those files before starting.

## Files

- `supabase/migrations/<ts>_waitlists.sql` (new): see Data. Regenerate DB types.
- `supabase/seed/states.sql` (new): the 43 missing states + DC, inactive, `on conflict (code) do nothing` (the 8 in `seed.sql` stay). 51 rows total.
- `supabase/seed/classroom.sql` (new): the classroom `courses` row (see Data).
- `src/lib/courses/courses.ts` (new, server-only, `cachedContent` tag `courses`, `createAnonClient()`):
  - `getOnlineCourse()`: the active CA course (`slug = 'california-traffic-violator-course'`) with price, list price and its 8 sections (`title` jsonb by UI language).
  - `getClassroomCourse()`: the classroom row (price only).
  - `listStates()`: all `states` rows (code, name, active), ordered by name.
  Ticket 09 reuses all three: keep them exported.
- `src/lib/courses/course-language.ts` (new, pure): `parseCourseLanguage(value): Locale | null` (validates `?course=` against `routing.locales`), `buyHref(courseLanguage, signedIn)` → `/signup?course=<lang>` or `/portal?course=<lang>`.
- `src/config/states/ca.ts` (new, pure): the 5 eligibility questions as ids in order (`validLicense`, `courtAllowed`, `noRecentSchool`, `nonCommercial`, `eligibleViolation`; wording in messages), `type EligibilityAnswers`, and `eligibilityResult(answers): { status: "eligible" } | { status: "notEligible" | "askCourt"; blockingQuestion: QuestionId } | { status: "incomplete" }`. The first "no" in question order blocks; "court allowed = no" and "valid license = no" → `askCourt`/`notEligible` per the copy you write (decide per question and document it in a comment table). All "yes" → `eligible`.
- `src/lib/validation/waitlists.ts` (new, shared): `stateWaitlistSchema` (`email`, `stateCode` = 2 uppercase letters), `classroomWaitlistSchema` (`email`, `countySlug`).
- `src/lib/waitlists/actions.ts` (new, `"use server"`): `joinStateWaitlist(input, locale)`, `joinClassroomWaitlist(input, locale)` through `runPublicForm` (extend `PublicFormName` with `"state-waitlist" | "classroom-waitlist"`). The state action rejects active states (field error); the classroom action looks up the County by slug and stores `county_id` + `locale`. Insert with the service client. No emails.
- `src/lib/citation-state.ts` (new): cookie name `ticket_state`, `parseTicketState(value)` (2 letters, else `CA`), 1-year max-age; a server reader `getTicketState()` using `cookies()`.
- `src/components/courses/citation-state-selector.tsx` (client, takes `states` + current code as props): a compact chip "Ticket from: California ▾" opening a popover (`src/components/ui/popover.tsx`) with a labelled `<select>` (or listbox) of the 51 states; choosing writes the cookie; if the chosen state is inactive, shows "Coming soon — notify me" with the State waitlist form (email). Ticket 09 puts this chip in the home hero.
- `src/components/courses/classroom-waitlist-form.tsx` (client): email + County `<select>` (all 58 from `listCounties()`, passed as props).
- `src/components/courses/language-cards.tsx`: 4 cards as links to `?course=<lang>` (works without JS; `aria-current="true"` + check icon on the selected one), flag and native name from `src/i18n/languages.ts`, "Original course" under English, a "LIVE" badge on each.
- `src/components/courses/course-panel.tsx`: "Available in 4 languages" pill, title "California Traffic Violator Course (TVC)", feature list with lucide icons (Defensive driving, Traffic violations, Driver awareness, Self-paced, 90 days of access, Interactive lessons, All devices, Certificate of completion, Reported to the DMV 3 times a day, **Built to DMV course rules (demo)**, never "DMV-licensed"), `public/placeholder/device-mockup.svg` (new, original, with alt text), the line "Lessons, quizzes and the final exam in {language}.", price + struck list price from the DB, "Start in {language}" button → `buyHref`.
- `src/app/[locale]/courses/page.tsx` (new): reads `?course=` (default = UI language), `getCurrentAccount()` for the button target; selector chip; cards + panel; below: 8-section syllabus (titles in the UI language, falling back to `en`), rules (25 questions, 70%, 2 attempts, minimum time, 90 days), reporting schedule (09:00, 13:00, 17:00 Pacific, from the CA `states.report_times`), refund summary (100/50/0, link to `/refund-policy`), Classroom waitlist card ($124.99 from the DB). `Course` + `offers` JSON-LD (add `course()` to `src/lib/seo/json-ld.ts`; price from the DB, `priceCurrency: "USD"`, provider from `siteConfig`). Metadata; canonical without the query string.
- `src/app/[locale]/eligibility/page.tsx` + `src/components/eligibility/eligibility-check.tsx` (client): 5 yes/no radio groups (fieldset + legend), a "Check" button, result panel (`role="status"`) naming the blocking answer and the next step (ask your Court → link to `/courts`, or not eligible), or "You're likely eligible" + enroll CTA → `/courses`. Nothing stored. Metadata.
- Sign-up keeps the Course language: `src/app/[locale]/(auth)/signup/page.tsx` reads `?course=`, validates it with `parseCourseLanguage`, and passes `next = "/portal?course=<lang>"` to `SignUpForm` → `signUp(…, next)` in `src/lib/auth/actions.ts`, which redirects to `returnPathSchema.parse(next)` when valid (same pattern as `signIn`), else home. Keep the existing sign-up tests green.
- `src/app/[locale]/portal/page.tsx`: when `?course=<lang>` is valid, show a notice "You chose the course in {language}. Payments arrive soon." (phase 4 replaces it with checkout). Never creates anything.
- `src/lib/seo/sitemap-pages.ts`: add `/courses` and `/eligibility`.
- `messages/*.json`: `Courses`, `Eligibility`, `CitationState`, `Waitlists` namespaces; `Portal.paymentsSoon`.

## Data

Migration `waitlists`:
- `public.classroom_waitlist`: `id`, `email text not null` (same check as `state_waitlist.email`), `county_id uuid not null references counties(id) on delete restrict`, `locale text not null check (locale in ('en','ja','es','ru'))`, timestamps + `set_updated_at` trigger. RLS on; `revoke all from anon, authenticated`; `grant select to authenticated` + policy "classroom_waitlist: admin reads" using `(select public.is_admin())`. No client insert.
- `public.state_waitlist`: today clients may insert directly (`20261125210000_data_model.sql`), which would bypass the rate limit and honeypot. Revoke client insert and drop the "anyone joins" policy, so inserts come only from the server action. Keep "admin reads".
- Classroom course: `courses` row `state_code 'CA'`, `slug 'california-classroom-course'`, `price_cents 12499`, `list_price_cents null`, `active false`.
- `tests/db/reference-data.db.test.ts` and `tests/db/data-access.db.test.ts` select the CA course with `.eq("state_code","CA").single()`; a second CA course breaks that. Change them to filter by the online course slug.

## Interfaces

```ts
getOnlineCourse(): Promise<{ id: string; priceCents: number; listPriceCents: number | null; sections: { position: number; title: Partial<Record<Locale, string>> }[] }>
getClassroomCourse(): Promise<{ priceCents: number }>
listStates(): Promise<{ code: string; name: string; active: boolean }[]>
parseCourseLanguage(value: unknown): Locale | null
buyHref(courseLanguage: Locale, signedIn: boolean): string
eligibilityResult(answers: Partial<EligibilityAnswers>): EligibilityResult
joinStateWaitlist(input: unknown, locale: Locale): Promise<PublicFormResult>
joinClassroomWaitlist(input: unknown, locale: Locale): Promise<PublicFormResult>
<CitationStateSelector states={...} current="CA" />
course(input): object   // json-ld.ts
```

## Test slices (in order)

1. Unit `src/config/states/ca.test.ts`: all yes → eligible; each single "no" → its blocking question and status; several "no" → the first in order; unanswered → incomplete.
2. Unit: `parseCourseLanguage`, `buyHref`, `parseTicketState`, waitlist schemas, `course()` JSON-LD.
3. DB `tests/db/waitlists.db.test.ts`: 51 states, only CA active; the classroom course is inactive at 12499; Visitor and Student can neither insert into nor read `state_waitlist` and `classroom_waitlist`; an Admin reads both.
4. E2E `tests/e2e/courses.spec.ts`: `/courses` and `/ru/courses` render; picking 日本語 sets `?course=ja`, the panel says Japanese, "Start in 日本語" links to `/signup?course=ja`; signing up from there lands on `/portal?course=ja` showing "Payments arrive soon"; a signed-in Student's button goes straight to `/portal?course=<lang>`; the "DMV-licensed" text never appears; `Course` JSON-LD with the DB price; axe clean.
5. E2E `tests/e2e/eligibility.spec.ts`: all-yes path → likely eligible; one-no path → names the blocking answer and next step; one other language; axe clean.
6. E2E `tests/e2e/waitlists.spec.ts` (unique `X-Forwarded-For` per test, as in ticket 06's specs): choose Texas in the selector → "Coming soon — notify me" → submit email → success and a `state_waitlist` row; the cookie persists the choice on reload; classroom waitlist with a County → success and a row; validation error translated; honeypot.
7. E2E `tests/e2e/courses.mobile.spec.ts`: language cards, eligibility and both waitlist forms at 375 px.

## Risks

- Honesty: "Built to DMV course rules (demo)", never "DMV-licensed".
- Enrollments are never created here (phase 4 webhook only); the Portal only shows a notice.
- `returnPathSchema` must keep rejecting off-site `next` values.
- No hand-written union of a DB enum (`scripts/check-conventions.ts`); course languages come from `routing.locales`.
- Brand values only via `siteConfig`.
