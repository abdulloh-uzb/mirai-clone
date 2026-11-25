# 10 Admin core

**Status:** resolved
**Blocked by:** 05, 07
**Plan:** `.scratch/lms/plans/10-admin-core.md`

Spec §11: admin shell + nav, adminWrite + audit_log, Dashboard, Students (search, profile, edit locked fields with reason, progress, attempts, view as student read-only), Enrollments (extend, exam reset, lock/unlock, change language before start), Orders & refunds (list, calculator, approve/deny).

- [x] Every admin write audited (DB test)

## Comments

- Landed on `lms` (ed2992f). Unit 234 pass, admin DB 5 pass. Stub pages for ticket 11 sections via admin/[section]. TODO(spec): paid exam reset.
