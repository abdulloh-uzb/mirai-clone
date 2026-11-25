# 06 Stripe checkout, webhook, orders

**Status:** ready-for-agent
**Blocked by:** none
**Plan:** `.scratch/lms/plans/06-checkout.md`

Spec §8 flow 1–4 + mock payments mode (lms spec decision 1). Purchase panel on /portal, 'Confirming payment…' polling, webhook idempotent by event id, receipt + welcome email, /portal/orders receipts.

- [ ] handleStripeEvent creates order paid + enrollment once
- [ ] Replayed event creates nothing (DB test)
- [ ] Mock checkout route
