# RoadReady Traffic School

An online traffic school (LMS) for California drivers, with one course in four languages (English, Japanese, Spanish, Russian).

> **Demo project. Not a licensed school.** The brand, license number (`DEMO-0000`), court data and reviews are placeholders. No real company is represented, and the DMV connection is a mock.

## Stack

Next.js 16 (App Router), Supabase (Postgres with RLS, Auth, Storage, pgvector), Stripe Checkout, next-intl, the Vercel AI SDK, Resend, @react-pdf/renderer, Vitest and Playwright. `spec.md` is the source of truth and `GLOSSARY.md` holds the vocabulary.

## Setup

Needs Node, pnpm and Docker.

```bash
pnpm install
pnpm db:start                      # local Supabase (API :54321, DB :54322, Mailpit :54324)
pnpm db:env                        # copy the values into .env.local (names are in .env.example)
pnpm db:reset                      # migrations + seed
pnpm db:seed:demo                  # demo accounts, a finished course, a certificate
pnpm dev                           # http://localhost:3000
```

### Demo accounts

Password for all three: `Demo-pass-2026!` (override with `DEMO_PASSWORD` before seeding).

| Account                     | What it is                                                                   |
| --------------------------- | ---------------------------------------------------------------------------- |
| `admin@roadready.example`   | Admin (`/admin`)                                                             |
| `student@roadready.example` | Finished the course, passed the exam, has a certificate reported as accepted |
| `learner@roadready.example` | Paid, details entered, first section done                                    |

The seed can be run again safely. Caught emails (sign-up, receipts) are in Mailpit at http://127.0.0.1:54324.

## Modes without external keys

- **Payments:** leave `STRIPE_SECRET_KEY` empty and checkout goes to `/api/stripe/mock-checkout`, which feeds the same handler as the real webhook (404 in production unless `PAYMENTS_MOCK=1`). Enrollments are created only by that handler.
- **AI assistant:** without `AI_API_KEY` an offline responder answers from the FAQ and knowledge base.
- **Reporting:** completions go to the DMV through the `StateReportingAdapter` interface; the MVP uses `MockCaliforniaAdapter`. `MOCK_REPORTING_ALWAYS_ACCEPT=1` makes it deterministic. `pnpm report:run` runs one batch by hand.
- **Cron:** `vercel.json` schedules `/api/cron/*` (reporting at 09:00, 13:00 and 17:00 America/Los_Angeles). Requests need `Authorization: Bearer $CRON_SECRET`.
- **Analytics:** PostHog loads only after the visitor accepts the cookie banner and only if `NEXT_PUBLIC_POSTHOG_KEY` is set. Sentry is not wired (see `src/lib/observability/report-error.ts`).

## Privacy and security

- Cookie banner with equal Accept and Decline buttons; "Privacy choices" in the footer reopens it.
- `/portal/privacy`: download your data as JSON, or request account deletion (reviewed by an Admin because completion records are kept 3 years).
- Security headers (CSP, nosniff, referrer policy, permissions policy, HSTS in production) are set in `next.config.ts`.

## Commands

| Command                                   | What it does                                               |
| ----------------------------------------- | ---------------------------------------------------------- |
| `pnpm dev`                                | Dev server on :3000                                        |
| `pnpm check`                              | Lint, typecheck, unit, db and e2e tests                    |
| `pnpm check:locked`                       | `db:reset` and `check` while holding the shared-stack lock |
| `pnpm lint` / `pnpm typecheck`            | ESLint, Prettier and conventions / `tsc`                   |
| `pnpm test:unit` / `test:db` / `test:e2e` | Vitest unit, Vitest against Supabase, Playwright           |
| `pnpm db:start` / `db:stop` / `db:reset`  | Local Supabase                                             |
| `pnpm db:new <name>` / `db:types`         | New migration / regenerate `src/lib/database.types.ts`     |
| `pnpm db:seed:demo`                       | Demo accounts and data                                     |
| `pnpm db:make-admin <email>`              | Make an existing account an Admin                          |
| `pnpm report:run`                         | Run one completion-report batch                            |

## Performance

JMeter performance, load and stress tests. The plan, targets and how to run them are in [`perf/PLAN.md`](perf/PLAN.md).

```bash
perf/run.sh performance   # 8 users, 5 min
perf/run.sh load          # 60 users, 15 min
perf/run.sh stress        # up to 300 users over 15 min
```

**Results:** not run yet.

## Structure

`src/app/[locale]` pages (public, `portal`, `admin`), `src/app/api` routes (Stripe, cron, AI, certificates, export), `src/components`, `src/lib` (domain logic by area), `src/i18n`, `messages/{en,ja,es,ru}.json`, `supabase/migrations`, `tests/{unit,db,e2e}`, `docs/adr`.

## Status

Spec section 17 is the acceptance checklist. All build-plan tickets are implemented; open follow-ups are marked `TODO(spec):` in the code (for example a nonce-based CSP and the Sentry SDK).
