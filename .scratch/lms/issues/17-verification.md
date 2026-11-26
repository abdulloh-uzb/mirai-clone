# 17 Full verification: e2e, Lighthouse, axe

**Status:** ready-for-agent
**Blocked by:** 15, 16

- [ ] `pnpm db:reset && pnpm test:e2e` all green (chromium + mobile)
- [ ] Lighthouse mobile ≥ 90 (performance, accessibility) on /, /courses, /courts/los-angeles-county on a production build; report scores
- [ ] axe: no serious/critical issues on every public page + portal + exam + admin dashboard (add to e2e)
- [ ] `pnpm check` green
