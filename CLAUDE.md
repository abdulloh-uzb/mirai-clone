# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Phase 1 (foundation) is in progress; phase specs and tickets live under `.scratch/`. `spec.md` is the source of truth. It calls itself `PROJECT_SPEC.md`, but the file on disk is `spec.md`. Read it before writing code and build in the order of its section 16 ("Build plan"). When the spec is unclear, choose the simplest option that satisfies it and leave a `TODO(spec):` comment.

## Commands

Next.js 16 (App Router, `src/` dir, `src/proxy.ts` instead of `middleware.ts`), pnpm, Supabase CLI via `pnpm supabase` (needs Docker).

| Command | What it does |
| --- | --- |
| `pnpm dev` | Next dev server on :3000 |
| `pnpm check` | The quality gate: lint, typecheck, unit, db and e2e tests. Must pass before work counts as done |
| `pnpm check:locked` | `pnpm db:reset && pnpm check` while holding the shared-stack lock. Use this one when other worktrees are active |
| `pnpm lint` | ESLint + `prettier --check` (`pnpm format` fixes formatting) + `scripts/check-conventions.ts` (brand only in site config, no hand-written DB enum unions) |
| `pnpm typecheck` | `next typegen && tsc --noEmit` |
| `pnpm test:unit` | Vitest `unit` project (`src/**/*.test.ts`, `tests/unit/**`) |
| `pnpm test:db` | Vitest `db` project (`tests/db/**/*.db.test.ts`) against local Supabase, one file at a time |
| `pnpm test:e2e` | Playwright (`tests/e2e`); starts its own `next dev` on `$PORT` (default 3000), never reuses a running server |
| `pnpm db:start` / `db:stop` | Start/stop local Supabase (API :54321, DB :54322, Mailpit :54324) |
| `pnpm db:reset` | Recreate the DB from `supabase/migrations` and run `supabase/seed.sql` |
| `pnpm db:new <name>` | New migration file. Never edit an applied migration |
| `pnpm db:env` | Print local URLs and keys for `.env.local` (see `.env.example`) |
| `pnpm db:types` | Regenerate `src/lib/database.types.ts` (committed) |

Single tests:

- Vitest: `pnpm vitest run --project unit src/i18n/fallback.test.ts -t "fills missing"` (use `--project db` for DB tests)
- Playwright: `pnpm playwright test tests/e2e/not-found.spec.ts -g "shown in ja" --project chromium`. Files named `*.mobile.spec.ts` run only in the `mobile` project (375 px wide).

Parallel agents share one local Supabase stack and port 3000, so run the full gate as `pnpm check:locked`, and wrap any other DB reset, DB test or Playwright run in `scripts/with-stack-lock.sh '<command>'`. Playwright tests a production build; set `E2E_DEV=1` for a quick single-test run on `next dev`. Tickets land on the integration branch only through `scripts/merge-ticket.sh`. Decisions are in `docs/adr/` (0002 covers the shared stack).

Layout: UI strings in `messages/{en,ja,es,ru}.json` (missing keys fall back to English); routing in `src/i18n/`; brand and contact details only in `src/config/site.ts`; page frame in `src/components/layout/`; shadcn/ui components in `src/components/ui/`.

## What it is

RoadReady Traffic School is a multilingual online traffic school (LMS) for California drivers. It has one course in four languages (en, ja, es, ru). The stack is Next.js 16 (App Router), Supabase (Postgres with RLS, Auth, Storage and pgvector), Stripe Checkout, next-intl, the Vercel AI SDK, Resend, @react-pdf/renderer, Vitest and Playwright. Spec section 3 has the full stack and the suggested folder layout.

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
