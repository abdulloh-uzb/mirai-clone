# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

The repo is still at the spec stage: the only file is `spec.md`, and there's no code yet. `spec.md` is the source of truth. It calls itself `PROJECT_SPEC.md`, but the file on disk is `spec.md`. Read it before writing code and build in the order of its section 16 ("Build plan"). When the spec is unclear, choose the simplest option that satisfies it and leave a `TODO(spec):` comment.

Update this file once the project has been scaffolded. Add the real build, lint and test commands, including how to run a single Vitest or Playwright test.

## What it is

RoadReady Traffic School is a multilingual online traffic school (LMS) for California drivers. It has one course in four languages (en, ja, es, ru). The stack is Next.js 15 (App Router), Supabase (Postgres with RLS, Auth, Storage and pgvector), Stripe Checkout, next-intl, the Vercel AI SDK, Resend, @react-pdf/renderer, Vitest and Playwright. Spec section 3 has the full stack and the suggested folder layout.

## Rules that are easy to break

- **Brand and content:** never use a real company's name, logo, license number, images or marketing copy. Write original copy and use placeholder images (`/public/placeholder/*`). Brand name and `licenseNumber = "DEMO-0000"` live only in `config/site.ts`. The footer shows a "Demo project — not a licensed school" note.
- **Server-only boundary:** the browser talks only to Next.js. Stripe, the LLM, email and the DMV adapter are called only from server code. The Supabase service-role key never reaches the client.
- **Exam integrity:** grading happens only on the server. `answer_options.is_correct` must never be readable by the client, and correct answers must never appear in a network response before submit. The AI assistant has no access to the question bank and is disabled during an active exam.
- **Enrollments are created only by the Stripe webhook** (`checkout.session.completed`). The webhook checks the signature and is idempotent by event id, so a replayed event creates nothing new. After checkout, the `/portal?paid=1` page polls for the new enrollment and never creates one.
- **Authorization:** roles (`profiles.role`: `student | admin`) are enforced by RLS and server code, never only by the UI. Postgres `security definer` functions enforce attempt limits, the pass threshold, the details lock, access expiry and minimum time. Every admin write goes to `audit_log`.
- **Details lock:** a DB trigger locks legal name, DOB and license number when the final exam starts. After that, only an admin can change them, and the change needs a reason and is audited.
- **Refunds:** `calculateRefund(order, enrollment, now)` is a pure function that returns 100%, 50% or 0% according to the table in spec section 8. Its unit tests must cover every case.
- **Reporting:** a cron job sends completions to the DMV at 09:00, 13:00 and 17:00 America/Los_Angeles, protected by `CRON_SECRET`. It goes through the `StateReportingAdapter` interface (the MVP uses `MockCaliforniaAdapter`). Every request and response is saved to `report_attempts`.
- **i18n:** `en` is the default locale and has no URL prefix. An explicit URL always wins, so never redirect `/faq` to `/ru/faq` because of a saved preference. A missing translation falls back to English and is flagged in admin.
- **Code quality:** TypeScript strict mode, no `any`, generated Supabase types, and Zod schemas shared by client and server for every input.

Spec section 17 is the acceptance checklist. Use it as the definition of done.

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature>/` (no remote). See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
