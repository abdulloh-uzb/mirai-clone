# 02 Driver/court details, validation and lock

**Status:** ready-for-agent
**Blocked by:** none
**Plan:** `.scratch/lms/plans/02-driver-details.md`

Spec §6 driver/court details: form after payment, Zod + DB constraints, placeholder DOB rejection, CA license regex, citation format, security question, lock trigger at final exam start, admin override with reason (audited).

- [x] Shared Zod schema + unit tests (placeholder DOBs rejected)
- [x] DB constraints + lock trigger + admin override function
- [x] Details form page with 'Where do I find this?' helper
- [x] Profile page (spec §6 /portal/profile)
