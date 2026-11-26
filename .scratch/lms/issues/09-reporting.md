# 09 Completion reporting

**Status:** resolved
**Blocked by:** 08
**Plan:** `.scratch/lms/plans/09-reporting.md`

Spec §9 cron batches: /api/cron/report-batch (CRON_SECRET, LA times), StateReportingAdapter + MockCaliforniaAdapter, report_attempts logged, statuses + retry with backoff (max 5), status emails, /portal/status/[enrollmentId] timeline.

- [x] queued → sent → accepted in next batch (DB/unit test)
- [x] Timeline page

## Comments

- Landed on `lms`. Unit 259 pass, reporting DB 3 pass. Includes admin reporting module + CSV. Known: tests/db/data-access.db.test.ts setup violates security_questions_question_check (from ticket 02) — fix in review pass.
