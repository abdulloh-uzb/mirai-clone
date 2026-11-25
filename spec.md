# PROJECT_SPEC.md — RoadReady Traffic School (LMS)

> Instructions for Claude Code: this file is the source of truth for the project.
> Read it fully before writing code. Build in the order of "Build plan" (section 16).
> When something is unclear, choose the simplest option that satisfies this spec and leave a `TODO(spec):` comment.

---

## 0. Brand and content rules (must follow)

- Brand name: **RoadReady Traffic School** (placeholder, set in `config/site.ts` so it can be renamed in one place).
- Layout, page structure, sections, flows and interactions follow the reference product (a multilingual California online traffic school) described in this file.
- **Do NOT use** any third-party company's name, logo, license number, images, illustrations, videos or marketing copy. Write original copy, use placeholder images (`/public/placeholder/*`) or generated/neutral illustrations.
- School license number: `config/site.ts → licenseNumber = "DEMO-0000"`. Show a "Demo project — not a licensed school" note in the footer.

---

## 1. Overview

A multilingual online traffic violator school for California drivers who received a traffic ticket. Completing the course lets the court hide the violation point from the driver's public record (avoids insurance increases and license points).

One course (California Traffic Violator Course), one curriculum, **4 languages**: English, Japanese, Spanish, Russian. The student chooses the course language before paying.

Main flow:

```
Ticket → court allows traffic school → student finds site → signs up → picks language + pays
→ enters driver/court details → studies 8 sections (+ quizzes) → final exam
→ certificate (PDF) → completion reported to DMV (3 batches/day) → court hides the point
```

Out of scope for MVP: real DMV integration (use a mock adapter), in-person classroom scheduling (waitlist only), native apps.

---

## 2. Roles

| Role | Who | Can do |
| --- | --- | --- |
| Student | Registered user | Buy course, study, quizzes, exam, certificate, reporting status, profile (with locks) |
| Admin | School staff | Everything: students, content, prices, coupons, refunds, reporting, settings |

- Not-signed-in visitors have no role: public pages + public AI assistant only.
- No teacher role (self-paced, auto-graded).
- Role stored in `profiles.role` (`'student' | 'admin'`), enforced by Supabase RLS + server code, never only by UI.

---

## 3. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js latest stable (App Router, RSC, Server Actions), TypeScript strict |
| UI | Tailwind CSS + shadcn/ui, lucide-react icons, light/dark theme (next-themes), Framer Motion (light use) |
| Forms | React Hook Form + Zod (shared schemas client/server) |
| DB / Auth / Storage | Supabase (Postgres + RLS, Auth, Storage, pgvector), `@supabase/ssr` |
| Payments | Stripe Checkout + webhooks + Refunds API |
| Jobs | Vercel Cron (route handlers) |
| AI | Vercel AI SDK (streaming), pgvector retrieval |
| Email | Resend + React Email (4 languages) |
| i18n | next-intl |
| PDF | @react-pdf/renderer |
| Analytics / errors | PostHog (after consent), Sentry |
| Tests | Vitest (unit), Playwright (E2E) |
| Hosting | Vercel |

Architecture rule: the browser talks only to Next.js. Stripe, LLM, email and DMV adapter are called **server-side only**. Service-role key never reaches the client.

### Suggested folder structure

```
app/
  [locale]/
    (public)/            page.tsx, courses/, eligibility/, courts/, courts/[slug]/,
                         dmv-services/, faq/, blog/, blog/[slug]/, about/, contact/,
                         terms/, privacy/, refund-policy/, accessibility/, school-rules/,
                         whats-new/, verify/[certNo]/
    (auth)/              login/, signup/, reset-password/
    portal/              page.tsx, course/[enrollmentId]/[section]/, exam/[enrollmentId]/,
                         certificates/, status/[enrollmentId]/, profile/, orders/
    admin/               dashboard, students, enrollments, orders, reporting, content,
                         courts, site-content, ai, tickets, settings
  api/
    stripe/webhook/route.ts
    ai/chat/route.ts
    cron/report-batch/route.ts
components/  (ui/, layout/, course/, exam/, portal/, admin/, ai/)
lib/         (supabase/, stripe/, ai/, reporting/adapters/, validation/, i18n/)
messages/    en.json ja.json es.json ru.json
supabase/    migrations/, seed.sql
config/      site.ts, states/ca.ts
```

---

## 4. Global UI (every public page)

Open chrome and open https://www.miraitrafficschool.com/ and try to make our website same as this. 
For such a tasks, use sonnet or haiku.

---

## 5. Public pages

All pages exist in 4 locales: `/` (en, no prefix), `/ja`, `/es`, `/ru` + same paths.

### 5.1 Home `/`
Sections in this order:
1. **Hero**: badge "California DMV-licensed school · {license}" (demo text), H1 "California Traffic School in Your Language." (per-locale version names the language, e.g. RU: course in Russian), price `$24.99` + struck `$34.99` + "SAVE $10" pill, buttons "Enroll Now" (primary) + "Explore Courses" (outline), trust row (Accepted in all CA courts · 5-star rated · Secure Stripe payments). Background: illustrated road/landscape (placeholder image).
2. **How it works — 4 steps**: Sign up → Learn at your own pace → Pass final test (25 questions, 70%, 2 attempts) → Get certificate.
3. **Course card**: course name, 90 days access, interactive lessons, "Reported to the DMV 3 times a day", CTA.
4. **Court finder teaser**: 14 popular county links + "See all 58 courts" + eligibility check link.
5. **Pricing**: $24.99 with inclusions, refund tier table (100% / 50% / 0%), classroom option $124.99 (waitlist).
6. **Reviews carousel**: average rating + cards (seed with clearly fake demo reviews marked as sample data in admin).
7. **AI assistant teaser**: "Try AI assistant" CTA.
8. **Short FAQ**: 4 questions + link to `/faq`.
9. **Final CTA**.

### 5.2 Course `/courses`
- Left: 4 language cards (flag, native name, "Original course" under English, "LIVE" badge, selected state with check).
- Right: course panel — "Available in 4 languages" pill, title "California Traffic Violator Course (TVC)", feature list with icons (Defensive driving, Traffic violations, Driver awareness, Self-paced, 90 days of access, Interactive lessons, All devices, Certificate of completion, Reported to the DMV 3 times a day, DMV-licensed), device illustration, line "Lessons, quizzes and the final exam in {language}.", price + "Start in {language}" button.
- Below: 8-section syllabus, rules, reporting schedule, refund summary, classroom waitlist card.

### 5.3 Other public pages
| Path | Content |
| --- | --- |
| `/eligibility` | 5 yes/no questions (valid license? court allowed traffic school? no traffic school in last 18 months? non-commercial license/vehicle? eligible moving violation?) → result + next step |
| `/courts` | H1, "Pick your county" map cards (4 popular), search (court, city, DMV code), list of 58 counties (name, city, court code, "+N more courthouses") |
| `/courts/[county]-county` | Courthouses, addresses, court codes, how to request traffic school, deadlines, where to find the citation number, link to the court's case lookup, CTA. SSG/ISR from DB |
| `/dmv-services` | Scenario tiles (moving to CA, renewals, REAL ID, buying/selling vehicle, replace documents, check status/pay) linking to official dmv.ca.gov pages; search; disclaimer "not affiliated with the DMV" near the top |
| `/faq` | H1 "Find an answer", count line, search, popular tags (refund, final exam, certificate, password), ~36 Q&A in 9 categories (About, Course info, Quizzes/exam/ID verification, Certificates & DMV reporting, Payments/refunds/tech support, Eligibility & legal, Language/ADA/accessibility, AI assistant, In-person classroom, Contact). Deep links `#slug` |
| `/blog`, `/blog/[slug]` | Posts per locale, categories, related posts |
| `/about`, `/contact` | Contact form → DB ticket + email |
| `/accessibility` | Statement + **ADA accommodation request form** (need, contact) → admin ticket |
| `/terms`, `/privacy`, `/refund-policy`, `/school-rules` | Admin-editable rich text |
| `/whats-new` | Changelog entries (date, title, text), admin-editable |
| `/verify/[certNo]` | Public: valid/invalid + completion date only |
| 404 | Big friendly "This page took a wrong turn" + green road-sign style card with 4 links (Courses, Find your court, DMV services, Questions and answers) + "Back to home" |

### 5.4 "Where is your ticket from?" selector
State selector (CA active; other states "Coming soon — notify me"). Stored in cookie, drives state config. Collect email for "notify me".

### 5.5 "Got a problem?" form
Modal: what happened, page URL (auto), optional screenshot upload, email (prefilled if signed in) → support ticket.

---

## 6. Auth and student portal

### Auth
Supabase Auth: email + password, magic link, Google OAuth (Google added after phase 1). Email verification before purchase (unverified students can sign in and see a "verify your email" banner). Password reset.

Signup collects: first name, last name, email, password, preferred language.

### Driver/court details (collected after payment, before section 1; editable until the final exam)
1. Full legal name (as on license)
2. Date of birth
3. Driver license number + issuing state
4. Phone
5. Court county (→ court)
6. Citation (ticket) number — with "Where do I find this?" helper (sample ticket image with number highlighted + link to the county court's case lookup)
7. Court due date

Validation (Zod + DB constraints):
- DOB: real date, age 15–100; reject placeholders like `1900-01-01`, `1900-02-02`.
- CA license: `^[A-Z][0-9]{7}$`.
- Citation: non-empty, allowed chars `[A-Z0-9-]`, per-court format if configured.
- Legal name, DOB, license number **lock** when the final exam starts (DB trigger). After that only admin can change them (with reason, audited).
- "Confirm your details" screen right before the final exam.

### Portal (header nav: My course · Account · Certificates · Questions and answers · Ask AI · user menu)
| Path | Content |
| --- | --- |
| `/portal` | No enrollment: "Purchase your course" (same language-card + course-panel layout as `/courses`). Enrolled: progress ring, current section, "Continue" button, days left of 90, court due date countdown, reporting status |
| `/portal/course/[enrollmentId]/[section]` | Course player (section 7) |
| `/portal/exam/[enrollmentId]` | Final exam |
| `/portal/certificates` | List + download. Empty states: not enrolled → "Buy the course"; in progress → "Continue your course" |
| `/portal/status/[enrollmentId]` | Timeline: Passed → Queued → Sent to DMV → DMV confirmed → Court notified (with timestamps) |
| `/portal/profile` | "My profile" card (avatar initials, name, email + "Contact support to change it", DOB "As on your license", phone), note "We send these to the DMV and the court exactly as written", "Edit details" button; "Enrollment history" card; "Privacy choices and data deletion" link |
| `/portal/orders` | Receipts, refund request + status |

---

## 7. Course engine

8 sections, unlocked strictly in order. Content stored per locale; structure and rules shared.

1. Traffic Safety Fundamentals
2. Traffic Laws and Right-of-Way
3. Safe Driving Maneuvers and Roadway Control
4. Defensive Driving and Hazard Awareness
5. Collision Avoidance and Safety Techniques
6. Road Rage and Driving Distractions
7. Vehicle Requirements and Maintenance
8. Course Review and Final Steps

- **Lessons**: 3–8 per section. Block types: rich text, image, video (captions), callout, flip card, scenario ("what would you do"), drag-to-order.
- **Autosave** progress on every block and on tab close.
- **Minimum time** per lesson (`lessons.min_seconds`); "Next" unlocks when reached. Count only while tab visible and user active in last 2 minutes. Course total minimum from state config.
- **Section quiz**: 5–10 random questions from the section pool, 70% to pass, unlimited retries (new random set), explanations after answering.
- **Identity checks**: 3–5 random personal questions during the course (DOB, last 4 of license, security question). 2 wrong in a row → enrollment paused for admin review. All logged.
- **Final exam**:
  - Unlocks after all 8 sections + minimum time.
  - Confirm-details screen first.
  - 25 random questions from the exam pool, pass = 70% (18/25).
  - 2 attempts; attempt 2 uses different questions where possible.
  - After 2 fails: enrollment locked; student sees options; admin can grant a reset (free or paid product).
  - No feedback during exam; score + pass/fail at end; review only after passing.
  - **Grading server-side only. Correct answers never sent to the client before submit.**
- **Access**: 90 days from purchase; banners at 14, 7, 1 days left; warning if court due date is too close.

---

## 8. Payments and refunds

- Stripe Checkout (hosted), USD. Products: online course $24.99 (list $34.99), classroom $124.99 (waitlist only), exam reset (admin price). Coupons = Stripe promotion codes.
- Flow:
  1. Student picks language → server action creates `orders` (status `pending`) + Checkout Session (metadata: `order_id`, `course_locale`).
  2. Redirect to `/portal?paid=1` → UI shows "Confirming payment…" and polls.
  3. Webhook `checkout.session.completed` (verify signature, idempotent by event id) → order `paid` + create enrollment. **Enrollment is created only by the webhook.**
  4. Receipt + welcome email.
- Refund rules (pure function `calculateRefund(order, enrollment, now)`, unit-tested):

| Condition | Refund |
| --- | --- |
| ≤ 7 days, no lesson started | 100% |
| ≤ 7 days, lessons started, final exam not started | 50% |
| > 7 days, or final exam started, or certificate issued | 0% |

- Student requests in `/portal/orders` → admin approves → Stripe Refunds API → webhook `charge.refunded` revokes enrollment.

---

## 9. Certificates and completion reporting

- On pass: generate PDF certificate immediately (@react-pdf), store in private bucket, download via signed URL. Content: legal name, license (masked except last 4), court, citation, completion date, certificate number, school name + license placeholder, QR → `/verify/[certNo]`.
- Insert `completion_reports` (status `queued`).
- Cron `/api/cron/report-batch` at **09:00, 13:00, 17:00 America/Los_Angeles** (secured with `CRON_SECRET`): collect queued rows → state adapter → update status `sent` / `accepted` (regulator ref) / `rejected` (reason) / `error` (retry with backoff, max 5).
- Status changes → email + portal timeline.
- Rejected/error → admin queue (edit + re-send).
- Adapter interface:
  ```ts
  interface StateReportingAdapter {
    submitCompletions(batch: CompletionPayload[]): Promise<SubmitResult[]>;
    checkStatus(ids: string[]): Promise<StatusResult[]>;
  }
  ```
  MVP: `MockCaliforniaAdapter` (random accept/reject with delays). Store every request/response in `report_attempts`.

---

## 10. AI assistant

- Widget on every page; header button "Ask AI" opens a side panel: title, language picker, reset (new chat), minimize; "Watch the tour" card; 3–4 **page-aware suggested questions**; disclaimer "Educational only · Official info: dmv.ca.gov · AI can make mistakes. Not legal advice."; "Talk to a person" link; input.
- Answers in the user's language.
- RAG over FAQ, school rules, refund policy, court pages, blog (`kb_chunks` with pgvector, re-index on content change).
- **Account tools** (signed-in only, read-only, server-side with user session): `getMyEnrollment`, `getMyReportStatus`, `getMyRefundEligibility`, `getMyCourtDeadline`. Must correctly say "you have not enrolled yet" for non-enrolled users.
- Guardrails: no legal advice; refuse exam answers; disabled during an active exam; never has access to the question bank.
- "Talk to a person" → support ticket with transcript.
- Rate limit per IP and per user; log conversations; track daily cost.

---

## 11. Admin panel `/admin` (role admin)

| Module | Functions |
| --- | --- |
| Dashboard | Sales today/7d/30d, enrollments, pass rate, avg completion time, reports by status, refunds, AI chats |
| Students | Search by name/email/license/citation; profile; edit locked fields with reason; progress; attempts; read-only "view as student" |
| Enrollments | Extend access, grant exam reset, lock/unlock, change language before start |
| Orders & refunds | List, refund calculator, approve/deny |
| Reporting | Batch history, per-report status, rejected/error queue, edit + re-send, CSV export |
| Content | Sections, lessons, blocks, quiz + exam question bank per locale, translation status, preview as student |
| Courts | 58 counties, courthouses, codes, instructions per locale, case-lookup URL |
| Site content | FAQ, legal pages, announcement bar, What's new, blog, prices, coupons, reviews |
| AI | Conversation logs, flagged answers, re-index |
| Tickets | Contact form, "Got a problem?", ADA requests, AI handoffs |
| Settings | Admin accounts, state config, email templates, "notify me" list per state |

Every admin write → `audit_log` (actor, action, entity, before, after, at).

---

## 12. i18n and SEO

- next-intl, locales `en` (default, no prefix), `ja`, `es`, `ru`. UI strings in `messages/*.json`; content in DB with `locale`.
- Language switcher keeps the current path and saves preference. **An explicit URL always wins** — never force-redirect `/faq` to `/ru/faq` because of a saved preference. First visit: suggest language from `Accept-Language` via a banner, no forced redirect.
- Course language fixed at purchase; UI language changeable anytime.
- Missing translation → English fallback + flag in admin.
- SEO: `generateMetadata` per page/locale (title, description, canonical, OG, Twitter); `hreflang` for 4 locales + `x-default`; `sitemap.xml` (all locales, courts, blog); `robots.txt`; portal/admin `noindex`; JSON-LD (`EducationalOrganization`, `Course` + `offers`, `FAQPage`, `BreadcrumbList`, `Article`); **every image has alt text**.

---

## 13. Data model (Supabase)

All tables: `id uuid pk default gen_random_uuid()`, `created_at`, `updated_at`. RLS enabled on all.

| Table | Key columns | Access |
| --- | --- | --- |
| profiles | user_id (fk auth.users), role (students cannot change their own role: blocked by trigger), first_name, last_name, legal_name, dob, license_no, license_state, phone, preferred_locale, details_locked_at | own read/update (locked fields blocked by trigger); admin all |
| states | code, name, min_course_minutes, exam_questions, pass_pct, max_attempts, access_days, report_times text[], adapter, active | public read |
| state_waitlist | state_code, email | insert public; admin read |
| courts | state_code, county, slug, name, city, court_code, address, case_lookup_url, citation_regex, instructions jsonb | public read |
| courses | state_code, slug, price_cents, list_price_cents, active | public read |
| sections | course_id, position, title jsonb (per locale) | public read |
| lessons | section_id, position, min_seconds, title jsonb | public read |
| lesson_blocks | lesson_id, position, type, content jsonb (per locale) | enrolled read |
| questions | section_id (null = exam pool), locale, text, explanation | via server only |
| answer_options | question_id, text, is_correct | **never readable by client** |
| orders | user_id, product, amount_cents, currency, status, stripe_session_id, stripe_payment_intent | own read |
| enrollments | user_id, course_id, order_id, course_locale, court_id, citation_no, court_due_date, status, started_at, expires_at, completed_at | own read; server write |
| lesson_progress | enrollment_id, lesson_id, seconds_spent, completed_at | via RPC with time checks |
| quiz_attempts / exam_attempts | enrollment_id, question_ids uuid[], answers jsonb, score, passed, started_at, submitted_at | own read after submit |
| identity_checks | enrollment_id, question_key, correct, asked_at | server only |
| security_questions | user_id, question, answer_hash (for identity checks) | server only |
| certificates | enrollment_id, cert_no unique, pdf_path, issued_at, revoked_at | own read |
| completion_reports | certificate_id, batch_id, status, regulator_ref, error | own read status |
| report_attempts | report_id, request jsonb, response jsonb, at | admin |
| refunds | order_id, amount_cents, pct, reason, status, approved_by | own read |
| stripe_events | event_id unique, type, processed_at (webhook idempotency) | server only |
| faq_items, pages, posts, announcements, changelog, reviews | locale, slug, title, body, published | public read published |
| ai_conversations / ai_messages | user_id nullable, role, content | own read |
| kb_chunks | source, locale, content, embedding vector(1536) | server |
| tickets | type (contact, bug, ada, ai_handoff), user_id, email, body, status | admin |
| audit_log | actor_id, action, entity, entity_id, before jsonb, after jsonb | admin |

Business rules enforced in Postgres functions (`security definer`), called from server actions: attempt limits, pass threshold, details lock, access expiry, minimum time.

RLS policies check the admin role through a `security definer` function `is_admin()`, never by querying `profiles` directly inside a `profiles` policy (that recurses).

---

## 14. Non-functional requirements

- **Performance**: Lighthouse mobile ≥ 90 on home/course/court pages; LCP < 2.5 s.
- **Mobile-first**: whole course + exam usable at 375 px.
- **Accessibility**: WCAG 2.1 AA — keyboard, focus, alt text, captions, contrast in both themes, accessible quiz controls.
- **Security**: RLS everywhere; Zod on every input; Stripe signature check; rate limits (auth, AI, exam); CSP headers; PII never in URLs or analytics.
- **Exam integrity**: server grading, randomization, one active exam session per user.
- **Privacy**: cookie consent (analytics off until accepted), data export + deletion request, retain completion records 3 years.
- **Reliability**: idempotent webhooks/jobs, retries with backoff, Sentry, Supabase backups.
- **Code quality**: TS strict, ESLint + Prettier, generated Supabase types, no `any`.

---

## 15. Environment variables (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
AI_API_KEY=
AI_MODEL=
CRON_SECRET=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

---

## 16. Build plan (do in this order)

1. **Foundation (wk 1–2)**: Next.js + TS + Tailwind + shadcn, next-intl (4 locales), theme toggle, local Supabase (Docker), migrations for all tables + RLS, auth pages (email + password, magic link, reset), profiles + roles, first-admin seed script, empty protected `/portal` and `/admin`, global layout (bar, header, footer, 404), `pnpm check` (lint, typecheck, Vitest, Playwright). Local only, no deploy.
2. **Public site (wk 3–4)**: home, courses, eligibility, courts list + county pages (seed 58 counties), DMV hub, FAQ, blog, legal pages, what's new, ticket-state selector, "Got a problem?" form, SEO (metadata, hreflang, sitemap, JSON-LD).
3. **Course + exam (wk 5–7)**: portal dashboard, details form + validation + lock, course player, autosave, minimum time, section quizzes, identity checks, final exam with server grading.
4. **Payments + certificates (wk 8–9)**: Stripe checkout + webhook, receipts, refund calculator + requests, PDF certificate, verify page. **Gate: full E2E flow works (signup → pay → study → pass → certificate).**
5. **Reporting + admin (wk 10–11)**: cron batches, mock adapter, status timeline + emails, all admin modules, audit log.
6. **AI + launch (wk 12)**: AI widget, RAG, account tools, guardrails; Playwright suite; accessibility + Lighthouse pass; README; seed demo data.

---

## 17. Acceptance checklist

- [ ] All public pages and emails work in EN / JA / ES / RU.
- [ ] Enrollment is created only by the Stripe webhook; replaying the webhook creates nothing new.
- [ ] Sections unlock in order; "Next" locked until minimum time.
- [ ] Final exam: 25 questions, 70%, 2 attempts; correct answers never appear in network responses before submit.
- [ ] Passing issues a PDF certificate; `/verify/[certNo]` works; report goes queued → sent → accepted in the next batch.
- [ ] Refund amounts match the 100 / 50 / 0 table in every case (unit tests).
- [ ] A student cannot read another student's data (RLS test).
- [ ] Placeholder DOBs (1900-01-01, 1900-02-02) are rejected.
- [ ] AI answers "Did the DMV get my completion?" with the student's real status, and tells non-enrolled users they have no enrollment.
- [ ] Visiting `/faq` directly never redirects to another locale.
- [ ] Lighthouse mobile ≥ 90 on home and course pages; no critical axe issues.
- [ ] No third-party brand names, logos, images or copied copy anywhere in the repo.