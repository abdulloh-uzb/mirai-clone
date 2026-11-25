# Plan 10: Admin core

**Goal:** `.scratch/lms/issues/10-admin-core.md` (spec §11 Dashboard, Students, Enrollments, Orders & refunds; audit log). Read `.scratch/lms/spec.md` decision 8.

Builds on 02 (`admin_update_locked_details`), 05 (`exam_resets`), 07 (refund actions, `/admin/refunds`).

## Shape

- `src/app/[locale]/admin/layout.tsx`: keep the role check (404 for non-admins); add a sidebar shell `src/components/admin/admin-shell.tsx` with links: Dashboard, Students, Enrollments, Orders & refunds, Reporting, Content, Courts, Site content, AI, Tickets, Settings (ticket 11 fills the last ones; render links anyway — pages that don't exist yet are fine to 404 until then, but prefer a stub page "Coming in this release" for each so nav never 404s). Admin UI is English-only chrome is acceptable? No — use messages (`Admin.*`) in 4 languages but terse.
- Reusable admin bits in `src/components/admin/`: `data-table.tsx` (server-rendered table with search param pagination `?page=`, `?q=`), `stat-card.tsx`, `confirm-form.tsx` (form with reason textarea, required for sensitive writes), `status-badge.tsx`.

## Audit helper

`src/lib/admin/admin-write.ts` (server-only):
```ts
adminWrite<T>({ action, entity, entityId, before?, run: (svc) => Promise<T>, after?: (result: T) => unknown, reason? }): Promise<T>
```
Checks `getCurrentAccount()?.role === 'admin'` (throws otherwise), runs `run` with the service client, inserts `audit_log { actor_id, action, entity, entity_id, before, after (with reason) }`. `requireAdmin()` helper too. Every admin server action in tickets 10–11 uses it (or a security definer SQL function that writes audit_log itself, like `admin_update_locked_details`).

## Modules

- **Dashboard** `/admin`: sales (sum of paid `orders.amount_cents`) today / 7 d / 30 d, new enrollments same windows, pass rate (passed exam attempts / submitted), average completion time (`completed_at - created_at` of completed enrollments), reports by status (counts of `completion_reports`), refunds (count/sum processed 30 d), AI chats (count `ai_conversations` 7 d). One server-side SQL function `public.admin_dashboard_stats()` (security definer, `is_admin()` check) returning jsonb, to keep it one round trip.
- **Students** `/admin/students?q=`: search by name, email (join `auth.users` — do it in a security definer function `public.admin_search_students(q text, lim int, off int)` checking `is_admin()`), license no, citation no. `/admin/students/[userId]`: profile fields, email, details lock state, enrollments with progress % and status, quiz/exam attempts (scores), identity checks log, orders/refunds, audit entries for this user. "Edit locked fields" form → `admin_update_locked_details` (reason required). Unlocked fields edit (phone etc.) via `adminWrite`. "View as student" → `/admin/students/[userId]/view`: read-only render of that student's dashboard data (reuse `src/components/portal/dashboard.tsx` with data fetched by service client and all actions disabled; banner "Read-only view as student").
- **Enrollments** `/admin/enrollments` (list + filters by status) and actions on the student page and a detail page `/admin/enrollments/[id]`: extend access (+N days, reason), grant exam reset (`exam_resets + 1`; if status `locked` → `active`; free — paid reset product `TODO(spec)`), lock/unlock (`locked` ↔ `active`, also unpause `paused` → `active`), change course language (only when `started_at is null`). All via `adminWrite`.
- **Orders & refunds** `/admin/orders`: orders list (user email, product, amount, status, date), detail with refund calculator (`calculateRefund` + `refund_facts`), and the refund requests queue (move/merge ticket 07's `/admin/refunds` page here; keep `/admin/refunds` redirecting to `/admin/orders?tab=refunds`). Approve/deny reuse ticket 07 actions (make sure they audit).

## Test slices

1. Unit: `adminWrite` with injected deps — refuses non-admin, writes audit row with before/after/reason.
2. DB `tests/db/admin.db.test.ts`: `admin_dashboard_stats` and `admin_search_students` refuse students, work for admins (search by email, license, citation); `admin_update_locked_details` audited (already tested in 02 — just one assertion here).
3. Server action tests are optional; keep slices small.

## Risks

- Every admin write → `audit_log`. Role enforced on the server (layout + every action), never only UI.
- "View as student" must be read-only (no actions wired).
- Service client only after `requireAdmin()`.
