# 18 Lighthouse mobile performance ≥ 90

**Status:** ready-for-human
**Blocked by:** 17

Ticket 17 measured 72–78 on /, /courses, /courts/los-angeles-county (default mobile emulation). FCP/LCP ~0.8 s, CLS 0; total blocking time 1.0–1.7 s is the only problem (see `.scratch/lms/lighthouse.md`). Goal: performance ≥ 90 on all three pages (median of 3 runs), no regressions.

## Plan
1. Measure first: `ANALYZE` via `@next/bundle-analyzer` (dev dep) or `next build --debug` output, and Lighthouse JSON (`--output=json`, look at `bootup-time`, `mainthread-work-breakdown`, `unused-javascript`, `third-party`, treemap). Write findings to `.scratch/lms/lighthouse.md`.
2. Shrink hydration on public pages:
   - Header: theme toggle, language switcher, user menu, mobile menu — keep them client but make them tiny (native `<details>`/`popover` attribute or CSS instead of Radix where it's only a menu), or render server HTML and hydrate on interaction.
   - Everything below the fold that's client (reviews carousel, waitlist/selector, FAQ search, county search, help widget, cookie banner): `next/dynamic` with a server-rendered fallback, or convert to server components + small client islands. Help widget/cookie banner: defer until idle (`requestIdleCallback`) .
   - Make sure Framer Motion / heavy libs aren't in public-page bundles; check `radix-ui` is imported per component, `lucide-react` icons tree-shake (`optimizePackageImports` in next.config).
   - `NextIntlClientProvider`: messages already trimmed (ticket 17); verify no full message JSON is inlined.
   - Sentry client and PostHog only after consent (already) — verify not in initial bundle.
3. Re-measure; iterate until ≥ 90 median on all three pages. Keep e2e green for touched features (run the relevant spec files + axe-sweep under the lock).

- [ ] ≥ 90 performance on the three pages (median of 3), scores in lighthouse.md (medians now 88 / 88 / 87, up from 76 / 75 / 83; not reached, see lighthouse.md for what is left)
- Iteration 2 medians 91 / 87 / 86 (single runs reach 91–94 on every page). Results are bimodal (LCP 2.5 s or 3.4 s) depending on whether framework hydration lands before the h1 paint. The app-level levers are used up; next steps are a larger refactor (partial prerendering, or dropping root NextIntlClientProvider messages). Left for a human decision.
- [x] lint, typecheck, unit pass; touched e2e specs + axe-sweep pass
