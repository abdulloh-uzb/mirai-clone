# 17 Full verification: e2e, Lighthouse, axe

**Status:** resolved (Lighthouse performance below 90, see lighthouse.md)
**Blocked by:** 15, 16

- [x] `pnpm db:reset && pnpm test:e2e` all green (chromium + mobile). Found and fixed one test-environment issue: the production build serves the mock checkout only with `PAYMENTS_MOCK=1`, so `playwright.config.ts` now sets it for the test server. The nonce CSP works under `next start` (nonce on Next scripts, JSON-LD and the theme script; hydration works; no CSP console errors)
- [ ] Lighthouse mobile ≥ 90 (performance, accessibility) on /, /courses, /courts/los-angeles-county on a production build; report scores. Accessibility is 100 on all three; performance is 72-78 (TBT-bound under 4x CPU slowdown; 100 without slowdown). Not met for performance, see `.scratch/lms/lighthouse.md`
- [x] axe: no serious/critical issues on every public page (en and ru) + portal (dashboard, lesson, exam, status, certificates, orders, profile) + admin dashboard (`tests/e2e/axe-sweep.spec.ts`)
- [x] `pnpm check` green
