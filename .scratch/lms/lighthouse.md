# Lighthouse (mobile emulation, production build)

Run: `pnpm build && pnpm next start -p 3000`, then
`npx lighthouse@latest <url> --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox"`
with Playwright's Chromium as `CHROME_PATH`. Default mobile profile (4x CPU slowdown, slow 4G).

| Page                       | Performance | Accessibility | Best practices | SEO |
| -------------------------- | ----------- | ------------- | -------------- | --- |
| /                          | 72-78       | 100           | 96             | 66  |
| /courses                   | 76-78       | 100           | 96             | 69  |
| /courts/los-angeles-county | 77-78       | 100           | 96             | 66  |

Metrics on every page: FCP and LCP 0.8-1.0 s, CLS 0, TBT 1.0-1.7 s (the only
thing holding performance below 90).

## Notes

- Accessibility is 100 everywhere. The e2e axe sweep (`tests/e2e/axe-sweep.spec.ts`) also passes.
- SEO below 90 is the site-wide `noindex` (`SITE_INDEXABLE` unset on purpose in
  demo mode). Everything else in the SEO category passes.
- Performance is limited by Total Blocking Time. With no CPU throttling
  (`--throttling.cpuSlowdownMultiplier=1`) `/` scores 100 (TBT 50 ms). Under the
  4x mobile slowdown the cost is React/Next hydration, the first layout and
  RSC payload parsing (about 120 ms of real main-thread work each) on a machine
  that was also running a browser and other apps, so runs vary by +-5 points.
- Fixes made for this ticket (before: 74 on `/`, TBT 1.4 s):
  - client messages limited to the namespaces client components read (RSC payload 57 KB to 26 KB of messages);
  - the AI assistant (chat SDK and sheet) loads only when it is first opened;
  - the bug report form and the state waitlist form (react-hook-form and zod) load only when their dialog opens;
  - the cookie banner no longer imports the zod env schema, so zod left the first load of most pages;
  - the browser Sentry SDK loads lazily, and only after analytics consent.
- Not done: further cuts need a smaller hydration tree (for example turning more
  of the header, footer and home sections into plain server HTML), which is a larger refactor.
