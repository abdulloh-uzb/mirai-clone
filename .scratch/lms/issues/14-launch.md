# 14 Launch

**Status:** resolved
**Blocked by:** all others
**Plan:** `.scratch/lms/plans/14-launch.md`

Spec §14 + §16.6: cookie consent (analytics off until accepted), data export + deletion request, CSP + security headers, rate limits review, README, demo seed (demo admin + demo student with a completed course), full-flow e2e spec (signup → pay (mock) → study → pass → certificate).

- [x] README with setup and demo accounts

## Comments

- Landed on `lms` (d9cc7c7). Unit 263 pass; full-flow e2e 1/1 (E2E_DEV). Demo seed verified. Not done: a11y pass (item 8). TODO(spec): nonce CSP, Sentry SDK.
