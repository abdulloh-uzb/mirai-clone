# Plan 07: Refunds

**Goal:** `.scratch/lms/issues/07-refunds.md` (spec §8 refund rules and flow). Read `.scratch/lms/spec.md` decision 1 (mock mode).

Builds on 06 (`handleStripeEvent`, `paymentsMode`, `getStripe`, `/portal/orders`).

## Pure function

`src/lib/payments/refund.ts`:
```ts
type RefundOrder = { paidAt: Date; amountCents: number; status: string }
type RefundEnrollment = { lessonsStarted: boolean; examStarted: boolean; certificateIssued: boolean } | null
calculateRefund(order, enrollment, now): { pct: 0 | 50 | 100; amountCents: number; reason: "full_window_unstarted" | "half_window_started" | "outside_window" | "exam_started" | "certificate_issued" | "not_paid" }
```
Rules (spec §8): `> 7 days` (strictly more than 7×24 h after `paidAt`) → 0; exam started → 0; certificate issued → 0; ≤ 7 days and no lesson started → 100; ≤ 7 days, lessons started, exam not started → 50. Order not `paid` → 0 `not_paid`. No enrollment → treat as not started. `amountCents = round(amount * pct / 100)`. Exactly 7 days → still ≤ 7 days.

Unit tests `src/lib/payments/refund.test.ts` must cover every row and boundary: day 0, exactly 7 d, 7 d + 1 ms, lessons started at day 3, exam started at day 2, certificate at day 1, not paid, null enrollment, odd cents rounding.

## Data — migration `refunds_flow`

- `orders.paid_at timestamptz` (set by `fulfill_checkout` — redefine it to set `paid_at = now()`).
- `refunds`: `unique` partial index — one open request (`status in ('requested','approved')`) per order.
- `public.refund_facts(p_order_id uuid) returns jsonb` (security definer; own order or admin): `{ paidAt, amountCents, status, lessonsStarted (any lesson_progress row with seconds_spent > 0), examStarted (any exam_attempts row), certificateIssued }`.
- `public.request_refund(p_order_id uuid, p_reason text, p_pct int, p_amount_cents int)` (security definer, `authenticated`, own paid order, no open request) inserts `refunds(status 'requested')`. The server action computes pct/amount with `calculateRefund` from `refund_facts`; the SQL re-checks the 7-day window and exam/certificate facts so a client can't claim 100% late (pct must equal the SQL-side recomputation; implement the same table in plpgsql `public.refund_pct(order_id, now)` and compare).
- `public.mark_refund(p_refund_id uuid, p_status text, p_actor uuid)` service-role only: transitions + `approved_by` + `audit_log`.
- `public.apply_refund_event(p_event_id text, p_payment_intent text, p_amount_refunded int) returns boolean` service-role only: idempotent via `stripe_events`; order → `refunded` (full) or `partially_refunded`; enrollment of that order → `status 'refunded'`; refund row → `processed`.

## Files

- `src/lib/payments/refund-actions.ts` (`"use server"`): `requestRefund(orderId, reason)` (student); `decideRefund(refundId, decision: "approve" | "deny")` (admin only; checks `getCurrentAccount().role === 'admin'`): approve → Stripe mode `stripe.refunds.create({ payment_intent, amount })` then wait for the webhook; mock mode → call `handleStripeEvent({ id: 'evt_mock_refund_<refundId>', type: 'charge.refunded', data: { object: { payment_intent, amount_refunded } } })`. Deny → `mark_refund(rejected)`. Both audited.
- `handleStripeEvent`: add `charge.refunded` → `apply_refund_event`, then email "refund processed".
- `/portal/orders`: per paid order show the calculator preview ("You can get $X (Y%) back" with the reason text) and a request form (reason textarea) when pct > 0 and no open request; show refund status badges.
- `src/app/[locale]/admin/refunds/page.tsx` (minimal; ticket 10 integrates into its Orders module): table of requested refunds with recomputed amount and Approve/Deny buttons.
- Emails: `refundRequestedEmail`, `refundProcessedEmail` (4 languages).
- `messages/*.json`: `Refunds`.

## Test slices

1. Unit `refund.test.ts` (the full table above) — this is an acceptance item.
2. DB `tests/db/refunds.db.test.ts`: request within 7 days with no progress → 100% row; request claiming 100% after lessons started → rejected; second open request rejected; student cannot request on someone else's order; `apply_refund_event` sets order refunded and enrollment refunded, replay with same event id is a no-op; lesson_blocks no longer readable by the student after refund (RLS requires active).

## Risks

- Refund amounts must match the table in every case.
- Only admins approve; enrollment revoked only by the refund event path.
