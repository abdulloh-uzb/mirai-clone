# Plan 06: Stripe checkout, webhook, orders

**Goal:** `.scratch/lms/issues/06-checkout.md` — spec §8 flow steps 1–4, with the **mock payments** mode from `.scratch/lms/spec.md` decision 1. Read that file first.

## Dependencies

`pnpm add stripe` (latest). No Stripe keys exist locally, so everything must work in mock mode; real mode is coded and type-checked but not exercised.

## Data — migration `checkout`

- `orders.course_locale text check (course_locale in ('en','ja','es','ru'))` (nullable; set for `online_course`).
- `public.fulfill_checkout(p_event_id text, p_event_type text, p_order_id uuid, p_session_id text, p_payment_intent text) returns boolean` — `security definer`, execute granted to `service_role` only (revoke from public/anon/authenticated). In one transaction: `insert into stripe_events (event_id, type, processed_at) values (...) on conflict (event_id) do nothing`; if nothing inserted → return false. Else lock the order (`for update`); if status `pending` → set `paid`, session id, payment intent; insert enrollment (`user_id`, `course_id` = active CA online course, `order_id`, `course_locale` from the order, `status 'active'`, `expires_at = now() + states.access_days days`) `on conflict (order_id) do nothing`. Return true.
- Regenerate types.

## Files

- `src/lib/stripe/server.ts` (server-only): `paymentsMode(): "stripe" | "mock"` (mock when `STRIPE_SECRET_KEY` empty); `getStripe()` (cached `new Stripe(key)`); `mockCheckoutAllowed()` (mock mode and (`NODE_ENV !== 'production'` or `PAYMENTS_MOCK === '1'`)).
- `src/lib/payments/handle-event.ts` (server-only): `type PaymentEvent = { id: string; type: string; data: { object: Record<string, unknown> } }` (structural subset of `Stripe.Event`). `handleStripeEvent(event): Promise<"processed" | "duplicate" | "ignored">`. For `checkout.session.completed`: read `metadata.order_id`, `id`, `payment_intent` → `rpc('fulfill_checkout')` with the service client; on true → send receipt + welcome emails (failures logged, never thrown). Other types → `"ignored"` (ticket 07 adds `charge.refunded`; structure as a `switch`).
- `src/app/api/stripe/webhook/route.ts`: `POST`; `export const runtime = "nodejs"`; `await req.text()`; `getStripe().webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)`; 400 on missing/bad signature; 200 `{received:true}` after `handleStripeEvent`. 404 in mock mode.
- `src/app/api/stripe/mock-checkout/route.ts`: `GET ?order=<uuid>`; 404 unless `mockCheckoutAllowed()`; the signed-in user must own the order and it must be `pending`; builds `{ id: "evt_mock_" + orderId, type: "checkout.session.completed", data: { object: { id: "cs_mock_" + orderId, payment_intent: "pi_mock_" + orderId, metadata: { order_id, course_locale } } } }` → `handleStripeEvent` → redirect to locale-correct `/portal?paid=1` (use the order's user preferred locale or `en`; `getPathname` from `src/i18n/navigation.ts`).
- `src/lib/payments/checkout-actions.ts` (`"use server"`): `startCheckout(formData)` with Zod `{ courseLanguage: locale enum from routing.locales, uiLocale }`. Requires signed-in (`getCurrentAccount`), `emailVerified` (else return `{ status: "error", formError: "verifyEmail" }`), no existing `active|paused|locked|completed` enrollment (else redirect to `/portal`). Inserts the pending order with the service client (amount = online course `price_cents` from `getOnlineCourse()` in `src/lib/courses/courses.ts`, currency usd, product `online_course`, `course_locale`). Stripe mode: `checkout.sessions.create({ mode: "payment", line_items: [{ price_data: { currency: "usd", unit_amount, product_data: { name: course name from messages } }, quantity: 1 }], customer_email, client_reference_id: userId, metadata: { order_id, course_locale }, allow_promotion_codes: true, success_url: <site>/<locale-path>/portal?paid=1, cancel_url: .../portal?course=<lang> })`, save `stripe_session_id`, `redirect(session.url)`. Mock mode: `redirect('/api/stripe/mock-checkout?order=' + id)`.
- `src/lib/payments/enrollment-status.ts` + `src/app/api/portal/enrollment/route.ts`: `GET` returns `{ enrolled: boolean }` for the signed-in user (own RLS read). Used by polling. Never creates anything.
- `src/components/portal/purchase-panel.tsx`: the `/courses` layout (reuse `LanguageCards` and `CoursePanel` from `src/components/courses/`; if `CoursePanel`'s button is a link, add an optional `action` slot/prop so the Portal renders a `<form action={startCheckout}>` submit button "Pay $24.99 and start in {language}" instead). Shows the verify-email error.
- `src/components/portal/payment-pending.tsx` (client): "Confirming payment…" with `role="status"`; polls `/api/portal/enrollment` every 2 s up to 60 s, then `router.replace('/portal')`; after 60 s shows "Taking longer than usual — refresh or contact support".
- `src/app/[locale]/portal/page.tsx`: no enrollment → `?paid=1` ? `PaymentPending` : `PurchasePanel` (course language from `?course=` else UI language). Has an enrollment → keep it minimal: a card linking to `/portal/details/<id>` ("Enter your driver details") — ticket 03 builds the real dashboard. Remove the `paymentsSoon` notice.
- `src/app/[locale]/portal/orders/page.tsx`: own orders (date, product name, amount formatted with `Intl.NumberFormat(locale, {style:'currency', currency:'USD'})`, status badge). Ticket 07 adds refund requests here — leave a clearly separated slot.
- Emails in `src/lib/email/templates.ts` (follow the existing template pattern): `receiptEmail` (order id short, amount, date) and `welcomeEmail` (course language, link to `/portal`), 4 languages, chosen by `profiles.preferred_locale`.
- `messages/*.json`: `Checkout`, `Orders` namespaces; remove now-unused `Portal.paymentsSoon` (update the e2e test that checks it: `tests/e2e/courses.spec.ts` — change the expectation to the purchase panel heading; don't run it).
- `.env.example`: document mock mode and `PAYMENTS_MOCK`.

## Test slices

1. Unit `src/lib/payments/handle-event.test.ts` with the RPC and email sender injected/mocked: ignored types; duplicate → no emails.
2. DB `tests/db/checkout.db.test.ts`: `fulfill_checkout` on a pending order → order paid + exactly one enrollment with `expires_at` ≈ now+90d and the order's course language; calling again with the **same event id** returns false and creates nothing; a **different event id** for the same order creates no second enrollment; `authenticated` cannot execute `fulfill_checkout`; a student cannot insert into `enrollments` or `orders` directly.
3. Write (don't run) `tests/e2e/checkout.spec.ts`: verified student → /portal → pick 日本語 → Pay → lands on `/portal?paid=1` → enrollment card appears; replay by visiting the mock URL again → still one enrollment.

## Risks

- Enrollment created only inside `fulfill_checkout` (called only by `handleStripeEvent`). The checkout action and `/portal?paid=1` never create one.
- Service-role key and Stripe secret stay server-only (`server-only` imports).
- Mock route must be impossible to use in production without `PAYMENTS_MOCK=1`.
