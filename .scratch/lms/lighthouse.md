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

## Ticket 18 (performance pass)

Re-measured with Lighthouse 12, mobile emulation, production build, median of 3
(this machine, other apps running; runs vary by +-4 points):

| Page                       | Before (median) | After (median) | After TBT | After LCP |
| -------------------------- | --------------- | -------------- | --------- | --------- |
| /                          | 76              | 88             | 300 ms    | 3.0 s     |
| /courses                   | 75              | 88             | 200 ms    | 3.5 s     |
| /courts/los-angeles-county | 83              | 87             | 200 ms    | 3.4 s     |

Target of 90 not reached on every page. What is left:

- Lighthouse's simulated LCP (about 3.4 s against a 1.2 s FCP) counts every main-thread
  task that starts before the observed paint. The ~100 ms React/Next framework
  evaluate-and-hydrate task usually starts just before the paint is presented,
  so it is counted (x4 CPU). When it starts a few ms later, LCP is 2.5 s and the
  page scores 92-94 (seen on `/` and `/courts/...`). That is run-to-run luck, not something the app controls.
- A bare text page (`/terms`) scores 84-88 on the same machine, so the floor is the framework.

Changes:

- Radix popper/dialog/menu code no longer loads with the page: language switcher, mobile menu,
  user menu, state selector and "Got a problem?" dialog render a plain trigger and load the
  Radix part on the first click (`React.lazy`, trigger stays visible while loading).
- Header strings are formatted on the server (language label, menu label, help widget label), so
  the browser does no ICU/message formatting during first load (was about 20 ms of `Intl` start-up).
  The help widget's expanded card is a lazy chunk.
- Suspense boundaries around the footer, floating widgets and each home section, so React
  hydrates them in separate, later tasks instead of one long one.
- `content-visibility: auto` (`.deferred-section`) on below-the-fold sections of `/`,
  `/courses` and the court page: layout 130 ms to 85 ms, PrePaint 46 ms to 2 ms on `/`.
- The classroom waitlist form (react-hook-form and zod) loads when it nears the viewport.
- No emoji flags in the header button and language cards (emoji font fallback cost ~25 ms of layout);
  the language cards show a code badge and do not pull the Noto Sans JP webfont for "日本語".

Tried and dropped: `experimental.inlineCss` (HTML doubled, TBT worse); `preload: false` for Inter
(font swap caused CLS 0.13).

## Ticket 18, iteration 2 (shared layout baseline)

Re-measured (Lighthouse 12 mobile, `next start`, 3 runs each, machine quieter than iteration 1):
`/` 93, 87, 91 (median 91); `/courses` 87, 93, 87 (median 87); `/courts/los-angeles-county` 85, 86, 94 (median 86).
Scores are bimodal: LCP is either 2.5-2.6 s (score 92-94) or 3.4-3.5 s (score 85-88), depending on
whether the ~200 ms framework hydration task starts before the LCP paint. TBT is 200-300 ms in both modes.

Findings:

- LCP element is the hero `<h1>` (server-rendered text), so there is no image or markup to fix.
- Shared first-load JS is about 215 KB gzip: react-dom 71 KB, Next client 32 KB, polyfills 40 KB
  (nomodule-style, still fetched), intl-messageformat 12 KB, small rest. The layout islands (cookie banner,
  language suggestion, help widget, assistant) are already lazy or tiny; no single one is worth deferring.
- RSC payload is 118 KB of a 210 KB HTML response (client messages 26 KB).
- Tried `font-display: optional` for Inter: no change (88/88/87 on `/`), reverted.

Not done: the target needs a smaller framework hydration cost (for example partial prerendering, or removing
`NextIntlClientProvider` messages from the root), which is a larger change than this pass. The box stays unticked.
