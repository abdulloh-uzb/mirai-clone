# 0002: One shared local Supabase stack for every worktree

**Status:** accepted (2026-11-25, phase 1)

## Context

Agents build tickets in parallel git worktrees. The dev machine has about 5 GB of RAM, so it can run only one local Supabase stack (Docker) and one Next.js server at a time. Phase 1 builds hit swap and first-visit timeouts in `next dev`.

## Decision

- Every worktree uses the same local stack (API :54321, DB :54322, Mailpit :54324) and port 3000.
- Any command that resets the DB, runs DB tests, runs Playwright or runs `pnpm check` holds one lock: `scripts/with-stack-lock.sh`. `pnpm check:locked` is the usual way to call it. The lock file defaults to `/tmp/claude-<uid>/roadready-stack.lock`; `ROADREADY_STACK_LOCK` overrides it.
- Playwright runs against `next build && next start` so pages compile once. `E2E_DEV=1` switches to `next dev` for quick single-test runs.
- At most 2 implementers run at once on this machine.
- Tickets reach the integration branch only through `scripts/merge-ticket.sh`, which runs the full check on that exact commit before it fast-forwards the branch.

## Consequences

- Parallel agents wait for each other's checks. Two implementers is the most this lock and this RAM can usefully handle.
- Each worktree needs its own `.env.local` (gitignored). Build it from `pnpm db:env` with the names in `.env.example`.
