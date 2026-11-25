# 07 Refunds

**Status:** resolved
**Blocked by:** 06
**Plan:** `.scratch/lms/plans/07-refunds.md`

Spec §8 refunds: pure calculateRefund with full unit tests, request from /portal/orders, admin approve/deny (server actions; admin UI page minimal here), Stripe Refunds API (mock mode aware), charge.refunded revokes enrollment.

- [x] calculateRefund covers every row of the table
- [x] Request → approve → refunded → enrollment status refunded

## Comments

- Landed on `lms` (feature 015449c). Unit 205 pass, refunds DB 7 pass. TODO(spec): approval does not re-check policy.
