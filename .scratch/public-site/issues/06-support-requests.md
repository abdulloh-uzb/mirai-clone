# 06: Support requests: contact, ADA and "Got a problem?"

**What to build:** Visitors and Students can send Support requests through the contact form, the ADA request form and the "Got a problem?" modal, protected by a honeypot and a Postgres rate limit, with confirmation emails through a new email sender. See `.scratch/public-site/spec.md` (Database changes, Forms and Support requests) and `docs/adr/0003-rate-limits-in-postgres.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Migration: `rate_limits` + `hit_rate_limit(key, max, window_seconds)` (`security definer`, prunes old rows); `tickets.page_url`, `tickets.attachment_path`, `tickets.details`; private bucket `support-attachments` with no client policies; regenerate DB types
- [ ] Shared form helper: Zod schema client + server, honeypot (filled → fake success), `hit_rate_limit` per IP per form (5 per 10 min), translated errors and rate-limit message
- [ ] `EmailSender` in `src/lib/email/`: SMTP → Mailpit locally, Resend when `RESEND_API_KEY` is set; plain English templates with `TODO(spec)` for React Email in phase 4
- [ ] `/contact`: name, email, topic, message → ticket `contact` + confirmation to sender + notification to `siteConfig.contact.email`
- [ ] `/accessibility`: ADA form (name, email, optional phone, need, preferred contact) → ticket `ada` + confirmation + notification
- [ ] "Got a problem?" modal from the announcement bar link and the footer: what happened, page URL (auto), optional screenshot (png/jpeg/webp, ≤ 5 MB, uploaded by the server), email prefilled and read-only when signed in → ticket `bug`
- [ ] E2E: each form succeeds; validation error; honeypot; rate-limit message; confirmation emails in Mailpit; screenshot upload; mobile for each form. DB: rate limit allows then blocks then resets; clients cannot read `tickets`; clients cannot read or write the bucket
- [ ] `pnpm check:locked` passes
