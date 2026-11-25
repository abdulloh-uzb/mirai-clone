# Plan 11: Admin content and operations

**Goal:** `.scratch/lms/issues/11-admin-rest.md` (spec §11 remaining modules). Builds on ticket 10 (`adminWrite`, `requireAdmin`, admin shell and table components) and 09 (reporting), 12 if merged (AI re-index; otherwise call `reindexKnowledgeBase` only if it exists — check `src/lib/ai/kb`).

All writes through `adminWrite` (audit). All reads with the service client after `requireAdmin()` (or the user client where admin RLS allows). Simple server-rendered forms with server actions + Zod; no rich editors (markdown textarea + preview with `src/components/content/markdown.tsx`).

## Modules
- **Reporting** `/admin/reporting`: batch history (`report_batches`), per-report table with status filter, rejected/error queue with edit (citation no, legal name override note → edits enrollment `citation_no`/court fields via `adminWrite`) + "Re-send" (status → `queued`, attempts 0), "Run batch now" (calls `runReportBatch({trigger:'manual'})`), CSV export route `src/app/api/admin/reports.csv/route.ts` (admin only, no caching).
- **Content** `/admin/content`: sections → lessons (title per locale, min_seconds) → blocks (type, per-locale JSON content edited as JSON textarea validated with `blockContentSchema` from `src/lib/course/blocks.ts`); question bank per section/exam pool + locale filter: create/edit question text, explanation, 4 options with one correct (radio); translation status matrix (for each lesson/block, which locales are missing → flagged). "Preview as student" → render a lesson with the player block renderer, read-only.
- **Courts** `/admin/courts`: counties (case lookup URL, instructions per locale JSON/markdown), courthouses (name, city, court code, address, citation_regex). Revalidate the `courts` cache tag (`src/lib/content/cache.ts`).
- **Site content** `/admin/site`: tabs for FAQ items, pages (terms, privacy, refund-policy, school-rules, about…), announcements, What's new (changelog), blog posts, reviews (with "sample" flag visible), prices (course `price_cents`/`list_price_cents`), coupons (list Stripe promotion codes when Stripe mode; in mock mode show "Coupons need Stripe keys" — `TODO(spec)`). CRUD per locale, publish toggle; revalidate the matching cache tags; flag missing translations (reuse `src/lib/content/translation.ts`). After FAQ/pages/posts/courts changes, call the KB re-index if available.
- **Tickets** `/admin/tickets`: list by type/status (contact, bug, ada, ai_handoff), detail with body/transcript, status change.
- **Settings** `/admin/settings`: admin accounts (list admins; promote by email via existing `make_admin` function / demote — never demote yourself), state config (CA: min minutes, exam questions, pass pct, max attempts, access days, report times, active), email templates (read-only list of template names + preview per locale; editing `TODO(spec)`), notify-me lists per state (`state_waitlist`) + classroom waitlist, CSV export.
- **AI** `/admin/ai`: conversation logs (list + transcript), flag/unflag messages, daily cost (from `ai_messages.cost_usd` if the column exists), "Re-index knowledge base" button. If ticket 12 hasn't merged yet, build the page against the existing tables only and leave the re-index button calling a stub that 12 replaces.

## Tests
- Unit: CSV builder (`src/lib/admin/csv.ts`: escaping quotes/commas/newlines), question form schema (exactly one correct option).
- DB: one test file `tests/db/admin-content.db.test.ts`: a student cannot write any of these tables directly; an admin write via a representative action helper inserts an audit row (call the underlying lib function with injected admin check if needed).

## Risks
- `answer_options.is_correct` is shown only in admin pages (server-rendered, admin-only).
- Every write audited. Keep pages lean — functional over pretty.
