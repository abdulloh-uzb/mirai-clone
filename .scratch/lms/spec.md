# LMS: course, exam, payments, certificates, reporting, admin, AI, launch

Phases 3–6 of `spec.md` (section 16), on integration branch **`lms`** (branched from `public-site`).
`spec.md` stays the source of truth (sections 6–14, 17). This file records the decisions that `spec.md` leaves open, so every ticket makes the same choice.

## Ways of working (owner's instructions, 2026-11-26)

- The owner is asleep and will not answer questions. Decide, leave a `TODO(spec):` comment, move on.
- Speed over ceremony: implementers run `pnpm lint`, `pnpm typecheck`, `pnpm test:unit` and their own DB tests only. **No Playwright runs** (write e2e specs only where a plan asks; they run later). No full `pnpm check` gate: the coordinator merges with a plain fast-forward/merge.
- Keep at most 2 implementers at once (5 GB RAM machine, one shared Supabase stack).

## Shared decisions

1. **Payments without keys.** Use the `stripe` npm package. When `STRIPE_SECRET_KEY` is empty, the app runs in **mock payments** mode: the checkout server action creates the pending order and redirects to `/api/stripe/mock-checkout?order=<id>` (a route handler that returns 404 unless mock mode is on and `NODE_ENV !== "production"` or `PAYMENTS_MOCK=1`). That route builds a fake `checkout.session.completed` event (`id = "evt_mock_<order id>"`) and passes it to the **same** `handleStripeEvent(event)` that the real webhook calls after verifying the signature, then redirects to `/portal?paid=1`. So enrollments are still created only by the webhook path, and replaying the same event id creates nothing. Refunds in mock mode skip the Stripe API and call `handleStripeEvent` with a fake `charge.refunded`.
2. **AI without keys.** Vercel AI SDK (`ai`) with `@ai-sdk/anthropic`; `AI_API_KEY`, `AI_MODEL` (default `claude-haiku-5-5`). Retrieval: Postgres full-text search over `kb_chunks.content` (add a generated `tsvector` column, `simple` config) — embeddings stay nullable; `TODO(spec)` for pgvector when an embedding key exists. With no `AI_API_KEY` an **offline responder** answers: account-tool intents (enrollment, DMV/report status, refund, court deadline) are matched by keywords in all 4 languages and answered from the real tool results; otherwise it returns the best retrieved chunk with its source link.
3. **Email.** Reuse `src/lib/email` (Mailpit locally, Resend when keyed). New templates live next to the existing ones, in all 4 languages, picked by the profile's `preferred_locale`.
4. **Files.** Certificates go to a private Storage bucket `certificates` (created in a migration via `insert into storage.buckets`). Download through a short-lived signed URL made by the server.
5. **Cron.** `vercel.json` crons at `0 16,17,20,21,0,1 * * *` (UTC, covers PST and PDT). The route checks `CRON_SECRET` (Bearer) and runs only when the current America/Los_Angeles hour is 9, 13 or 17, unless `?force=1` (still needs the secret).
6. **Exam/quiz delivery.** Questions are sent to the browser as `{ id, text, options: { id, text }[] }` only. Options are shuffled server-side. `is_correct` and explanations are never selected by any code path that returns before submit.
7. **Business rules live in Postgres** `security definer` functions (attempt limits, pass threshold, details lock, access expiry, minimum time), called by server actions with the signed-in user's client (so `auth.uid()` is the Student) or the service client where noted.
8. **Admin writes** go through one helper `adminWrite()` (ticket 10) that checks `is_admin`, performs the write with the service client and inserts `audit_log`. Until ticket 10 lands, earlier tickets that need an admin write add a small security-definer SQL function that writes `audit_log` itself.
9. **Course content** is original, written for this demo: 8 sections × 3 lessons, short. Every block type appears at least once. Lesson `min_seconds` = 60 (demo), and the CA `states.min_course_minutes` = total of the lessons' minutes. `TODO(spec)`: real minimums.
10. **Design.** `.scratch/lms/design-notes.md` (from a study of the reference site) guides the global UI restyle (ticket 13). Layout and style only — never their name, logo, images or copy.

## Tickets

01 course content seed · 02 driver details + lock · 03 portal dashboard + course player · 04 section quizzes + identity checks · 05 final exam · 06 checkout + webhook + orders · 07 refunds · 08 certificates + verify · 09 completion reporting · 10 admin core · 11 admin content and operations · 12 AI assistant · 13 global UI restyle · 14 launch (privacy, headers, README, demo data, full-flow e2e)
