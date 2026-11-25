# Plan 09: Completion reporting

**Goal:** `.scratch/lms/issues/09-reporting.md` (spec §9 cron + adapter + statuses, §6 `/portal/status/[enrollmentId]`). Read `.scratch/lms/spec.md` decision 5.

Builds on 08 (`completion_reports` queued rows, certificates).

## Data — migration `reporting`

- `completion_reports`: add `attempts int not null default 0`, `next_attempt_at timestamptz`, `sent_at`, `accepted_at`, `rejected_at timestamptz`, `court_notified_at timestamptz`. Grant students select on the timestamp columns too (keep `regulator_ref`, `error` hidden).
- `public.report_batches` (new): `id`, `started_at`, `finished_at`, `trigger text check in ('cron','manual')`, `counts jsonb`. RLS on, admin read.
- Writes are service-role only (the cron uses the service client).

## Files

- `src/lib/reporting/types.ts`: `CompletionPayload` (reportId, certNo, legalName, dob, licenseNo, licenseState, courtCode/countyName, citationNo, completedAt), `SubmitResult` (`{ reportId, status: "sent" | "accepted" | "rejected" | "error", regulatorRef?, reason? }`), `StatusResult`, and the `StateReportingAdapter` interface exactly as spec §9.
- `src/lib/reporting/adapters/mock-california.ts`: `MockCaliforniaAdapter` with injectable `random()` and `delay()` (defaults `Math.random`, small `setTimeout` up to 200 ms). `submitCompletions`: per item → `sent` (with ref `CA-MOCK-xxxxxx`) mostly, ~5% `rejected` (reason "Citation not found"), ~5% `error`. `checkStatus(ids)`: `sent` → `accepted` (~90%) or `rejected`. Set `MOCK_REPORTING_ALWAYS_ACCEPT=1` env to make it deterministic (used by the demo + tests).
- `src/lib/reporting/adapters/index.ts`: `adapterFor(states.adapter)` (`"mock-california"` → mock).
- `src/lib/reporting/schedule.ts` (pure): `isReportingSlot(now, times = ["09:00","13:00","17:00"], tz = "America/Los_Angeles")` (match the hour), `nextBackoff(attempts)` → minutes `[5, 15, 60, 180, 720]`, `MAX_ATTEMPTS = 5`.
- `src/lib/reporting/run-batch.ts` (server-only, service client): `runReportBatch({ trigger, now })`:
  1. insert `report_batches`.
  2. `checkStatus` for rows `sent` → update to `accepted` (`accepted_at`, `regulator_ref`) / `rejected` (`rejected_at`, `error`); log `report_attempts` (request/response).
  3. Collect `queued` rows + `error` rows with `attempts < 5` and `next_attempt_at <= now`; build payloads (join certificate → enrollment → profile, county); `submitCompletions`; per result update status, `batch_id`, `attempts + 1`, `sent_at`, `next_attempt_at = now + nextBackoff` for errors; log `report_attempts` for every request/response.
  4. After `accepted`, mark `court_notified_at = accepted_at` (mock: the court is notified with the DMV acceptance; `TODO(spec)`).
  5. Send status emails on changes (sent, accepted, rejected) in the student's preferred language.
  6. finish batch with counts. Returns counts.
  So "queued → sent → accepted in the next batch" holds.
- `src/app/api/cron/report-batch/route.ts`: `GET`; `Authorization: Bearer ${CRON_SECRET}` required (401 otherwise, also when `CRON_SECRET` unset); `?force=1` skips the slot check; outside slot → 200 `{ skipped: true }`.
- `vercel.json`: `{ "crons": [{ "path": "/api/cron/report-batch", "schedule": "0 16,17,20,21,0,1 * * *" }] }`.
- `src/app/[locale]/portal/status/[enrollmentId]/page.tsx`: timeline Passed (`completed_at`) → Queued (report `created_at`) → Sent to DMV (`sent_at`) → DMV confirmed (`accepted_at`) → Court notified (`court_notified_at`), each with timestamp formatted in the UI locale and America/Los_Angeles; rejected → red step with "We're fixing this — our team will resend" text; next batch time hint (`nextReportingSlot(now)` in schedule.ts).
- Dashboard (ticket 03 component): replace the reporting placeholder with the current status + link to the timeline.
- `scripts/run-report-batch.ts` + `"report:run": "tsx scripts/run-report-batch.ts"` for local manual runs (force).
- Emails: `reportStatusEmail(status)` 4 languages.
- `messages/*.json`: `ReportStatus`.

## Test slices

1. Unit: `schedule.test.ts` (09:00/13:00/17:00 LA in both PST and PDT dates match; 10:00 doesn't; backoff; next slot), mock adapter with stubbed random.
2. Unit `run-batch.test.ts` is optional; prefer DB:
3. DB `tests/db/reporting.db.test.ts` (with `MOCK_REPORTING_ALWAYS_ACCEPT=1`, calling `runReportBatch` directly — import via relative path; it's server-only, so set up the vitest `db` project alias for `server-only` if needed, as other db tests do): queued → after batch 1 `sent` + `report_attempts` row; after batch 2 `accepted` with `regulator_ref`; an `error` row retried with backoff and stops after 5 attempts; student can read status but not `regulator_ref`/`error`.
4. Route test (unit, mocking `runReportBatch`): 401 without secret, skip outside slot, runs with force.

## Risks

- Every request and response logged in `report_attempts`.
- Cron secret required; never expose service data to the student beyond status/timestamps.
