# 09 Completion reporting

**Status:** ready-for-agent
**Blocked by:** 08
**Plan:** `.scratch/lms/plans/09-reporting.md`

Spec §9 cron batches: /api/cron/report-batch (CRON_SECRET, LA times), StateReportingAdapter + MockCaliforniaAdapter, report_attempts logged, statuses + retry with backoff (max 5), status emails, /portal/status/[enrollmentId] timeline.

- [x] queued → sent → accepted in next batch (DB/unit test)
- [x] Timeline page
