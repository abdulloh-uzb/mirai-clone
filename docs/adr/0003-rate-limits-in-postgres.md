# 0003: Rate limits live in Postgres, not Redis

**Status:** accepted (2026-11-25, phase 2)

## Context

Phase 2 opens public forms to Visitors (contact, "Got a problem?", ADA request, state and classroom waitlists), and later phases need limits on sign-in, the AI assistant and the exam. The usual choice is Redis or Upstash, but the project runs on one local Supabase stack (ADR 0002) and adding another service costs RAM and a second thing to deploy.

## Decision

Rate limits are counters in a Postgres table, checked and incremented by one `security definer` function (key = form or action + IP or user id, fixed time window). Server actions call it before doing any work. Every public form also has a honeypot field.

## Consequences

- One extra write per limited request. That is fine at this traffic; if it stops being fine, swap the function's body for Redis and keep the call sites.
- Old counter rows need pruning (cron or on write).
