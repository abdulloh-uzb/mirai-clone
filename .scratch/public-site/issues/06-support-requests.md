# 06: Support requests: contact, ADA and "Got a problem?"

**What to build:** Visitors and Students can send Support requests through the contact form, the ADA request form and the "Got a problem?" modal, protected by a honeypot and a Postgres rate limit, with confirmation emails through a new email sender. See `.scratch/public-site/spec.md` (Database changes, Forms and Support requests) and `docs/adr/0003-rate-limits-in-postgres.md`.

**Blocked by:** 01

**Status:** resolved

- [x] Migration: `rate_limits` + `hit_rate_limit(key, max, window_seconds)` (`security definer`, prunes old rows); `tickets.page_url`, `tickets.attachment_path`, `tickets.details`; private bucket `support-attachments` with no client policies; regenerate DB types
- [x] Shared form helper: Zod schema client + server, honeypot (filled → fake success), `hit_rate_limit` per IP per form (5 per 10 min), translated errors and rate-limit message
- [x] `EmailSender` in `src/lib/email/`: SMTP → Mailpit locally, Resend when `RESEND_API_KEY` is set; plain English templates with `TODO(spec)` for React Email in phase 4
- [x] `/contact`: name, email, topic, message → ticket `contact` + confirmation to sender + notification to `siteConfig.contact.email`
- [x] `/accessibility`: ADA form (name, email, optional phone, need, preferred contact) → ticket `ada` + confirmation + notification
- [x] "Got a problem?" modal from the announcement bar link and the footer: what happened, page URL (auto), optional screenshot (png/jpeg/webp, ≤ 5 MB, uploaded by the server), email prefilled and read-only when signed in → ticket `bug`
- [x] E2E: each form succeeds; validation error; honeypot; rate-limit message; confirmation emails in Mailpit; screenshot upload; mobile for each form. DB: rate limit allows then blocks then resets; clients cannot read `tickets`; clients cannot read or write the bucket
- [x] `pnpm check:locked` passes

## Comments

- 2026-11-26: Resolved. Landed on `public-site` in cd9f17d (merge 80bf7a2) via `scripts/merge-ticket.sh` (unit 109, db 80, e2e 67). Notes: local storage is now enabled in `supabase/config.toml` (costs RAM on the shared stack); `hit_rate_limit` is service-role only; the email sender's env is in `src/lib/email/env.ts`; migration `20261126100000_support_requests.sql`; the actions store the UI language in `tickets.details.locale`. `TODO(spec)`: local email goes to Mailpit over its HTTP API, not SMTP; emails are plain English until phase 4; the `/accessibility` statement is a placeholder until ticket 02.
