# 06 Stripe checkout, webhook, orders

**Status:** resolved
**Blocked by:** none
**Plan:** `.scratch/lms/plans/06-checkout.md`

Spec §8 flow 1–4 + mock payments mode (lms spec decision 1). Purchase panel on /portal, 'Confirming payment…' polling, webhook idempotent by event id, receipt + welcome email, /portal/orders receipts.

- [x] handleStripeEvent creates order paid + enrollment once
- [x] Replayed event creates nothing (DB test)
- [x] Mock checkout route

## Comments

- Landed on `lms` (feature 50f1361). Unit 179 pass, checkout DB 5 pass. Mock payments mode; emails in src/lib/email/payment-templates.ts.
