# Performance test plan

JMeter tests for RoadReady: one plan (`perf/roadready.jmx`), three profiles. Results go into the "Performance" section of the root `README.md`.

## Goals

1. **Performance (baseline):** how fast each page is when the server is not busy.
2. **Load:** whether the expected busy hour stays within the targets below for 15 minutes.
3. **Stress:** how many users it takes before responses get too slow or start failing, and whether the server recovers.

## What is tested

Only read requests (GET of server-rendered pages). Each request is the HTML document; JavaScript, CSS and images are not fetched, because in production they come from a CDN and cost the server nothing.

| Group                                                   | Share | Pages, in order, each iteration                                                                                                                                                |
| ------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Visitors** (not signed in)                            | ~67%  | V01 home, V02 courses, V03 FAQ, V04 courts list, V05 a county court page, V06 blog list, V07 a blog post. Each iteration picks a UI language: half English, the rest ja/es/ru. |
| **Students** (signed in as `learner@roadready.example`) | ~25%  | S01 portal, S02 course section 1, S03 orders, S04 certificates                                                                                                                 |
| **Admins** (signed in as `admin@roadready.example`)     | ~8%   | A01 dashboard, A02 students, A03 orders, A04 course content, A05 DMV reporting                                                                                                 |

Each request waits a random "think time" before it is sent, like a person reading the page.

**Left out on purpose:**

- Sign-up, sign-in, checkout and Stripe: they create data and are rate-limited.
- Exam submits.
- The AI assistant: it calls a paid API and is rate-limited.
- The cron batch.

Testing those needs its own plan with clean-up.

## Profiles

| Profile       | Users (V / S / A)   | Ramp-up                            | Duration | Think time |
| ------------- | ------------------- | ---------------------------------- | -------- | ---------- |
| `performance` | 5 / 2 / 1 = 8       | 30 s                               | 5 min    | 1–2 s      |
| `load`        | 40 / 15 / 5 = 60    | 2 min                              | 15 min   | 2–5 s      |
| `stress`      | 200 / 75 / 25 = 300 | 15 min (users grow the whole time) | 20 min   | 1–3 s      |

Change a number in `perf/profiles/<name>.properties`, or pass it on the command line, for example `-Jvisitors=100` in `run.sh`.

## Targets (pass/fail)

| Measure                                                     | Target                               |
| ----------------------------------------------------------- | ------------------------------------ |
| Errors (not 200, or a signed-in page that ends on `/login`) | under 1% in `performance` and `load` |
| p95 response time, public pages                             | under 1,000 ms in `load`             |
| p95 response time, portal and admin pages                   | under 2,000 ms in `load`             |

**Breaking point in `stress`:** the user count at which either of these first holds for a whole minute:

- errors exceed 5%;
- p95 exceeds 5 s.

Read it from the report's "Response Time Over Time" and "Active Threads Over Time" graphs.

## Environment

- **What runs:** a production build (`pnpm build`, then `PAYMENTS_MOCK=1 pnpm start`), never `pnpm dev`, against the local Supabase stack with the demo seed.
- **No other load:** stop other dev servers, Playwright and Docker jobs before a run.
- **Shared machine:** JMeter runs on the same machine as Next.js and Supabase (8 cores, 5 GB RAM). The numbers are lower than on a real server and are only good for comparing runs on this machine. The README must say so next to the results.
- **One account per group:** all Students share one account, and all Admins share another. Real users would each have their own data and cache.

## How to run

Run the profiles in this order, with at least 2 minutes of rest between them.

```bash
pnpm db:start && pnpm db:seed:demo
pnpm build
PAYMENTS_MOCK=1 pnpm start          # terminal 1
perf/run.sh performance             # terminal 2
perf/run.sh load
perf/run.sh stress
```

`run.sh` does the following:

1. Checks the server answers.
2. Signs in the demo Student and Admin (`perf/scripts/make-session.mjs`, which writes `perf/data/session.tsv`; this file holds session cookies and is git-ignored).
3. Runs JMeter without the GUI, with a small heap.
4. Builds the HTML report and prints a Markdown summary.

Everything for one run lands in `perf/results/<profile>-<time>/`. That folder is git-ignored:

- `results.jtl`
- `jmeter.log`
- `report/index.html`
- `summary.md`

To look at or change the plan: `jmeter -t perf/roadready.jmx` (GUI, for editing only; never run load from the GUI).

## After the runs

1. Paste each `summary.md` table into README.md › Performance.
2. Under each table, write in 2–3 lines:
   - whether the targets were met;
   - the slowest pages;
   - for `stress`, the breaking point and whether errors stopped once the load ended.
3. Keep screenshots of the stress graphs in `docs/perf/` if needed. The full HTML reports are not committed.
