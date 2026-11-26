> **Orchestrator amendments (override anything below):**
> - Owner decisions: theme default stays "system" (no change); any refund → Registered; overdue-but-`active` enrollments → Needs attention; "Needs attention" support requests = `tickets.status in ('open','in_progress')`.
> - NEVER run `pnpm db:reset` (it wipes the owner's manual test data). Apply the new migration with `scripts/with-stack-lock.sh 'pnpm supabase migration up && pnpm db:types'`. The local stack is running.
> - A production server is running on :3000 from `.next`. Do not build, start/stop servers, or run e2e.

# Plan: Admin shell and Dashboard redesign (ADR 0005)

## 0. What I verified in the repo (this is what the plan is built on)

- `src/app/[locale]/layout.tsx` currently holds the whole public frame. `ThemeProvider` uses `defaultTheme="system"`.
- Admin auth lives in `admin/layout.tsx`, using `getCurrentAccount()` and `notFound()`.
- `AdminShell` exports `ADMIN_SECTIONS`. The only other user is `admin/[section]/page.tsx`, a stub. Every section in that list now has a real page, so the stub only ever returns a 404.
- `/admin/refunds` already redirects to `/admin/orders?tab=refunds`. So the sidebar gets one item, "Orders & refunds" → `/admin/orders` (with `/admin/refunds` as an alias for the active highlight). The refund queue is reached through the existing in-page tab.
- Students search uses `?q=` and the `admin_search_students(q, lim, off)` RPC (in `supabase/migrations/20261126230000_admin_core.sql`). It already matches name, legal name, email, license number and `enrollments.citation_no`. Only the stage filter is missing.
- Schema:
  - `enrollments.status` is one of active, paused, locked, completed, expired, refunded. Other columns: `expires_at`, `court_due_date`, `created_at`, `updated_at`.
  - `'expired'` is set lazily, so an `active` row can be past `expires_at`.
  - A completion report links to an enrollment like this: `completion_reports.certificate_id` → `certificates.id`; `certificates.enrollment_id` is unique.
  - `completion_reports.status` is one of queued, sent, accepted, rejected, error. `rejected_at` was added in `20261127100000_reporting.sql`.
  - `refunds.status = 'requested'` marks a request; `refunds.order_id` → `orders.user_id`.
  - `tickets.status` is one of open, in_progress, closed. "Open" = `'open'`.
  - Any processed refund sets the enrollment to `refunded`, even a 50% refund.
- **The latest migration is future-dated (`20261127100000`), and today is 2026-11-26.** `pnpm db:new` would create a file that sorts *before* it. The new migration must be named `20261127110000_admin_dashboard.sql`.
- Route types are keyed by URL, not by file path (`.next/types/routes.d.ts`). Groups and `@slots` are stripped, so the existing `PageProps<"/[locale]/...">` calls do not change.
- The only thing in the codebase that depends on a file path is `src/lib/privacy/actions.ts:33`: `revalidatePath("/[locale]/portal/privacy", "page")`. Next's docs say this path must include the route group.
- These do not depend on the `[locale]` file layout and need no change:
  - `sitemap.ts`, `robots.ts`, `src/lib/seo/sitemap-pages`
  - `scripts/check-conventions.ts`
  - eslint and vitest config
  - There is no `error.tsx` and no `opengraph-image` under `[locale]`.
- Relative imports exist only inside `(auth)`, and they move together with it.
- lucide-react 1.80.0 is installed, and every icon named below exists in it.
- recharts is not installed.
- `components.json` uses the new-york style and points at `src/components/ui`. `shadcn add chart` would go there and may try to rewrite `card.tsx` and the `--chart-*` variables in `globals.css`. So the chart primitive is written by hand (step 7).
- Messages are typed (`src/global.d.ts`), so every `t()` key must exist in `en.json`.
- After sign-in, an Admin is redirected to `/admin` (`actions.ts:163`). The e2e `signIn()` helper then waits for `getByRole("banner").getByRole("button", { name: firstName })`. **The admin top bar must be a `<header>` whose account button shows the first name as visible text.**
- CSP allows inline styles (`style-src 'unsafe-inline'`).
- `next-themes` cannot be nested.

## 1. Styling approach

**Chosen: admin-owned primitives in `src/components/admin/ui/*`, on a neutral palette that applies while the shell is on the page.**

Why:
- The marketing primitives (`ui/button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`) hard-code their shape: `rounded-full`, `border-2`, `min-h-11`, `rounded-[22px]`. Overriding tokens alone cannot make them compact. New admin pieces therefore use their own shadcn-default classes.
- Token overrides alone are also not enough, because the not-yet-restyled admin pages paint with tokens (`border-line-blue`, `bg-hero`, `.lms-table`, `bg-card`).
- So one file, `src/styles/admin.css`, sets neutral values for both the shadcn tokens and the reference tokens under `html:root:has(.admin-shell)` and `html.dark:has(.admin-shell)`:
  - Specificity is (0,2,1), which beats `html:root` / `html.dark` (0,1,1) in `lms.css`.
  - Because the rule hangs off `<html>`, Radix portals (dropdowns, the sheet) get the palette too.
- The old `v2 v2-root lms-scope lms-admin` wrapper is dropped. A small compat block replaces `.lms-admin` so bare inputs and DataTables in old pages stay usable and dense.
- Old pages keep pill buttons. Per settled decision 1 that is acceptable until they are restyled.

## 2. Steps

Each step is one commit. Before verifying a step, run `pnpm format`. Every commit body ends with:

```
Claude-Session: https://claude.ai/code/session_01DubEBM3rod3fp2Kets1yiy
```

Never run `pnpm build`, `pnpm dev` or e2e tests. Run `pnpm` commands one at a time, never in parallel.

### Step 1: move public pages into the `(site)` route group

Commit: `refactor(app): move public pages into a (site) route group (ADR 0005)`

1. Move the files:
   ```
   cd "/home/usmonov/projects/mirai-clone/src/app/[locale]"
   mkdir "(site)"
   git mv about accessibility "(auth)" blog contact courses courts dmv-services eligibility faq page.tsx portal privacy refund-policy "[...rest]" school-rules terms verify whats-new "(site)/"
   git mv not-found.tsx ../../components/layout/not-found-content.tsx
   ```
   Afterwards `ls` should show only `(site) admin layout.tsx`.

2. `src/components/layout/not-found-content.tsx`: rename `export default function NotFound` to `export function NotFoundContent`. The body stays as it is.

3. New `src/components/layout/site-frame.tsx`, an async server component `SiteFrame({ locale, children }: { locale: Locale; children: React.ReactNode })`.
   - Move everything that is currently inside `<NextIntlClientProvider>` in the root layout into it, unchanged and in the same order: `SkipLink`, `LanguageSuggestion`, `AnnouncementBar locale`, `SiteHeader`, `VerifyEmailBanner`, `<main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">{children}</main>`, then four `Suspense` blocks: `SiteFooter`, `HelpWidget collapsedLabel={helpT("collapsedLabel")}`, `LazyAssistantPanel`, `CookieConsent posthogKey/posthogHost`.
   - Keep the existing Suspense comment.
   - `helpT = await getTranslations({ locale, namespace: "HelpWidget" })`.
   - Return a fragment.

4. `src/app/[locale]/layout.tsx`:
   - Remove every frame import and `helpT`.
   - The body becomes `<body className="flex min-h-full flex-col antialiased"><ThemeProvider …same props…><NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider></ThemeProvider></body>`.
   - Keep the fonts, `generateStaticParams`, `generateMetadata`, the nonce and `../globals.css`.

5. New `src/app/[locale]/(site)/layout.tsx`:
   ```tsx
   /** The public site frame (ADR 0005). Site-wide, non-Admin things go here, not in the root layout. */
   export default async function SiteLayout({ children, params }: LayoutProps<"/[locale]">) {
     const { locale } = await params;
     if (!hasLocale(routing.locales, locale)) notFound();
     return <SiteFrame locale={locale}>{children}</SiteFrame>;
   }
   ```

6. New `src/app/[locale]/(site)/not-found.tsx`: `export default function SiteNotFound() { return <NotFoundContent />; }`

7. New `src/app/[locale]/not-found.tsx`. It is reached when a layout above `(site)` calls `notFound()`, which is the Admin layout for anyone who is not an Admin. It draws the public frame itself so the 404 looks the same as every other one.
   ```tsx
   export default async function LocaleNotFound() {
     const locale = await getLocale();
     return <SiteFrame locale={locale}><NotFoundContent /></SiteFrame>;
   }
   ```

8. `src/app/[locale]/(site)/[...rest]/page.tsx`: change the comment to refer to `(site)/not-found.tsx`.

9. `src/lib/privacy/actions.ts:33`: change the path to `revalidatePath("/[locale]/(site)/portal/privacy", "page")`.

Verify: `pnpm typecheck && pnpm lint && pnpm test:unit`

### Step 2: admin palette and admin primitives

Commit: `feat(admin): neutral admin palette and compact admin primitives`

**`src/styles/admin.css`**. Import it in `globals.css` right after `@import "../styles/lms.css";` with `@import "../styles/admin.css";`.

Light block, `html:root:has(.admin-shell){…}`:

```
--radius:.5rem; --background:#ffffff; --foreground:#0a0a0a; --card:#ffffff; --card-foreground:#0a0a0a; --popover:#ffffff; --popover-foreground:#0a0a0a;
--primary:#38b6ff; --primary-foreground:#0f1217; --secondary:#f5f5f5; --secondary-foreground:#0a0a0a; --muted:#f5f5f5; --muted-foreground:#636363;
--accent:#eaf6fe; --accent-foreground:#0b3b5c; --destructive:#dc2626; --border:#e5e5e5; --input:#d4d4d4; --ring:#0879b8; --link:#0770a9; --heading:#0a0a0a;
--sidebar:#fafafa; --sidebar-foreground:#0a0a0a; --sidebar-border:#e5e5e5; --chart-1:#38b6ff; --chart-2:#525252;
/* reference tokens still used by not-yet-restyled Admin pages */
--ink:#0a0a0a; --v2-muted:#636363; --hero:#f5f5f5; --surface:#fafafa; --v2-card:#ffffff; --page:#ffffff; --line-blue:#e5e5e5; --soft-border:#e5e5e5; --outline:#d4d4d4; --blue-tint:#eaf6fe;
```

Dark block, `html.dark:has(.admin-shell){…}`, placed after the light block:

```
--background:#0a0a0a; --foreground:#fafafa; --card:#141414; --card-foreground:#fafafa; --popover:#171717; --popover-foreground:#fafafa; --secondary:#262626; --secondary-foreground:#fafafa; --muted:#1f1f1f; --muted-foreground:#a3a3a3; --accent:#0f2a3b; --accent-foreground:#e0f2fe; --destructive:#dc2626; --border:#262626; --input:#3a3a3a; --ring:#38b6ff; --link:#38b6ff; --heading:#fafafa; --sidebar:#111111; --sidebar-foreground:#fafafa; --sidebar-border:#262626; --chart-1:#38b6ff; --chart-2:#d4d4d4; --ink:#fafafa; --v2-muted:#a3a3a3; --hero:#1f1f1f; --surface:#141414; --v2-card:#141414; --page:#0a0a0a; --line-blue:#262626; --soft-border:#262626; --outline:#3a3a3a; --blue-tint:#0f2a3b;
```

Compat rules, inside `@layer reference { … }`. Everything in this layer sits below Tailwind utilities, so utility classes still win.

```css
.admin-shell :where(h1,h2,h3){font-weight:600;letter-spacing:-.01em}
.admin-shell :where(input:not([type=checkbox],[type=radio],[type=hidden],[type=file],[type=submit],[type=button]),select,textarea){min-height:2.25rem;padding:.25rem .75rem;border:1px solid var(--input);border-radius:.375rem;background:var(--background);color:var(--foreground);font-size:.875rem}
.admin-shell :where(textarea){min-height:6rem;padding-block:.5rem}
.admin-shell :where(input,select,textarea):focus-visible{border-color:var(--primary);outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 25%,transparent)}
.admin-shell :where(input[type=checkbox],input[type=radio]){width:1rem;height:1rem;accent-color:var(--primary)}
.admin-shell :where(details>summary){cursor:pointer}
.admin-shell .lms-table{font-size:.875rem}
.admin-shell .lms-table :is(th,th:first-child,th:last-child){padding:.5rem .75rem;border-radius:0;background:var(--muted);color:var(--muted-foreground);font-size:.75rem;font-weight:500;letter-spacing:0;text-transform:none}
.admin-shell .lms-table td{padding:.5rem .75rem;border-bottom-color:var(--border);vertical-align:middle}
```

**`src/components/admin/ui/button.tsx`**: `adminButtonVariants` (cva) and `AdminButton` (with `asChild` via `Slot.Root` from `radix-ui`, like `ui/button`).

- Base: `inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`
- Variants:

| Variant | Classes |
| --- | --- |
| `default` | `bg-primary text-primary-foreground shadow-xs hover:bg-primary/90` |
| `outline` | `border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground` |
| `secondary` | `bg-muted text-foreground hover:bg-muted/70` |
| `ghost` | `text-foreground hover:bg-accent hover:text-accent-foreground` |
| `destructive` | `bg-destructive text-white shadow-xs hover:bg-destructive/90` |
| `link` | `h-auto px-0 text-link underline-offset-4 hover:underline` |

- Sizes:

| Size | Classes |
| --- | --- |
| `default` | `h-9 px-4 has-[>svg]:px-3` |
| `sm` | `h-8 gap-1.5 px-3 has-[>svg]:px-2.5` |
| `xs` | `h-7 gap-1 px-2 text-xs` |
| `icon` | `size-9` |
| `icon-sm` | `size-8` |

- Defaults: `default` / `default`.

**`src/components/admin/ui/input.tsx`**: `AdminInput`, classes `h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30`.

**`src/components/admin/ui/card.tsx`**:

| Component | Element | Classes |
| --- | --- | --- |
| `AdminCard` | div | `rounded-lg border bg-card text-card-foreground shadow-xs` |
| `AdminCardHeader` | div | `flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3` |
| `AdminCardTitle` | h2 | `text-sm leading-none font-semibold` |
| `AdminCardDescription` | p | `mt-1 text-xs text-muted-foreground` |
| `AdminCardContent` | div | `p-4` |

**`src/components/admin/ui/badge.tsx`**: `adminBadgeVariants`, `AdminBadge`, `export type AdminBadgeTone = NonNullable<VariantProps<typeof adminBadgeVariants>["tone"]>`.

- Base: `inline-flex w-fit items-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3`
- Tones:

| Tone | Classes |
| --- | --- |
| `neutral` | `bg-muted text-foreground` |
| `info` | `bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200` |
| `success` | `bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200` |
| `warning` | `bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200` |
| `danger` | `bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200` |
| `done` | `bg-emerald-700 text-white` |

- Default: `neutral`.

**`src/components/admin/ui/table.tsx`**:

| Component | Element | Classes |
| --- | --- | --- |
| `AdminTable` | wrapper div + table | div `relative w-full overflow-x-auto`; table `w-full caption-bottom text-sm` |
| `AdminTableHeader` | thead | `[&_tr]:border-b` |
| `AdminTableBody` | tbody | `[&_tr:last-child]:border-0` |
| `AdminTableRow` | tr | `border-b transition-colors hover:bg-muted/50` |
| `AdminTableHead` | th | `h-9 px-3 text-left align-middle text-xs font-medium whitespace-nowrap text-muted-foreground` |
| `AdminTableCell` | td | `px-3 py-2 align-middle whitespace-nowrap` |

Verify: `pnpm lint && pnpm typecheck`

### Step 3: migration, generated types, DB tests

Commit: `feat(db): student stages, needs-attention items and daily activity for the admin dashboard`

Create the file `supabase/migrations/20261127110000_admin_dashboard.sql` by hand, not with `db:new`; see section 0 for why.

```sql
-- Admin dashboard (ADR 0005): Student stages, the Needs attention list and the
-- 30-day activity chart. Admin RPCs are security definer with an is_admin() check.

create type public.student_stage as enum
  ('registered', 'studying', 'needs_attention', 'completed', 'reported');

-- The one place the Student stage rule lives (GLOSSARY.md, "Student stages").
-- Input is the Student's most recent enrollment; all null when there is none.
create or replace function public.enrollment_stage(
  p_status text default null,
  p_expires_at timestamptz default null,
  p_report_accepted boolean default false
)
returns public.student_stage
language sql
stable
set search_path = ''
as $$
  select (case
    when p_status is null or p_status = 'refunded' then 'registered'
    when p_status in ('paused', 'locked', 'expired') then 'needs_attention'
    when p_status = 'completed' and coalesce(p_report_accepted, false) then 'reported'
    when p_status = 'completed' then 'completed'
    -- Out of access time; the flip to 'expired' happens lazily.
    when p_expires_at is not null and p_expires_at <= now() then 'needs_attention'
    else 'studying'
  end)::public.student_stage;
$$;

revoke execute on function public.enrollment_stage(text, timestamptz, boolean) from public, anon;
grant execute on function public.enrollment_stage(text, timestamptz, boolean) to authenticated;

-- Every Student (role student) with the stage of their most recent enrollment.
create or replace function public.admin_student_stages()
returns table (user_id uuid, stage public.student_stage, enrollment_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select p.user_id,
         public.enrollment_stage(le.status, le.expires_at, le.report_accepted),
         le.id
  from public.profiles p
  left join lateral (
    select e.id, e.status, e.expires_at,
           exists (
             select 1
             from public.certificates c
             join public.completion_reports r on r.certificate_id = c.id
             where c.enrollment_id = e.id and r.status = 'accepted'
           ) as report_accepted
    from public.enrollments e
    where e.user_id = p.user_id
    order by e.created_at desc, e.id desc
    limit 1
  ) le on true
  where p.role = 'student';
end;
$$;

revoke execute on function public.admin_student_stages() from public, anon;
grant execute on function public.admin_student_stages() to authenticated;

-- Five rows, one per stage in enum order, zero when empty.
create or replace function public.admin_stage_counts()
returns table (stage public.student_stage, students bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select st.stage, count(s.user_id)::bigint
  from unnest(enum_range(null::public.student_stage)) as st(stage)
  left join public.admin_student_stages() s on s.stage = st.stage
  group by st.stage
  order by st.stage;
end;
$$;

revoke execute on function public.admin_stage_counts() from public, anon;
grant execute on function public.admin_stage_counts() to authenticated;

-- Student search gains a stage filter and returns each Student's stage.
-- The input is `stage_filter`: an IN parameter may not share the name of the `stage` output column.
drop function public.admin_search_students(text, integer, integer);

create function public.admin_search_students(
  q text,
  stage_filter public.student_stage default null,
  lim integer default 25,
  off integer default 0
)
returns table (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  legal_name text,
  license_no text,
  created_at timestamptz,
  stage public.student_stage
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  pattern text := '%' || replace(replace(replace(trim(coalesce(q, '')), '\', '\\'), '%', '\%'), '_', '\_') || '%';
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select p.user_id, u.email::text, p.first_name, p.last_name, p.legal_name,
         p.license_no, p.created_at, s.stage
  from public.profiles p
  join auth.users u on u.id = p.user_id
  join public.admin_student_stages() s on s.user_id = p.user_id
  where p.role = 'student'
    and (stage_filter is null or s.stage = stage_filter)
    and (
      trim(coalesce(q, '')) = ''
      or u.email ilike pattern
      or (p.first_name || ' ' || p.last_name) ilike pattern
      or coalesce(p.legal_name, '') ilike pattern
      or coalesce(p.license_no, '') ilike pattern
      or exists (
        select 1 from public.enrollments e
        where e.user_id = p.user_id and coalesce(e.citation_no, '') ilike pattern
      )
    )
  order by p.created_at desc
  limit greatest(1, least(coalesce(lim, 25), 100))
  offset greatest(0, coalesce(off, 0));
end;
$$;

revoke execute on function public.admin_search_students(text, public.student_stage, integer, integer) from public, anon;
grant execute on function public.admin_search_students(text, public.student_stage, integer, integer) to authenticated;

-- Sales (paid and partially refunded orders) and new enrollments per school day
-- (America/Los_Angeles), oldest first, with missing days as 0.
create or replace function public.admin_daily_activity(p_days integer default 30)
returns table (day date, sales_cents bigint, enrollments bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_days integer := greatest(1, least(coalesce(p_days, 30), 90));
  v_today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  select d.day::date,
         coalesce((
           select sum(o.amount_cents) from public.orders o
           where o.status in ('paid', 'partially_refunded')
             and (o.created_at at time zone 'America/Los_Angeles')::date = d.day::date
         ), 0)::bigint,
         (
           select count(*) from public.enrollments e
           where (e.created_at at time zone 'America/Los_Angeles')::date = d.day::date
         )::bigint
  from generate_series(v_today - (v_days - 1), v_today, interval '1 day') as d(day)
  order by d.day;
end;
$$;

revoke execute on function public.admin_daily_activity(integer) from public, anon;
grant execute on function public.admin_daily_activity(integer) to authenticated;

-- Things only an Admin can fix, oldest first, at most p_limit per kind, with
-- the total per kind. `detail` is the report status, refund status, enrollment
-- status ('expired' for an overdue active one), ticket type, or enrollment status.
create or replace function public.admin_attention_items(p_limit integer default 5)
returns table (
  kind text,
  ref_id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  detail text,
  amount_cents integer,
  due_date date,
  since timestamptz,
  total bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_limit integer := greatest(1, least(coalesce(p_limit, 5), 50));
  v_today date := (now() at time zone 'America/Los_Angeles')::date;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  return query
  with items as (
    select 'report_failed'::text as kind, r.id as ref_id, e.user_id as user_id,
           r.status as detail, null::integer as amount_cents, null::date as due_date,
           coalesce(r.rejected_at, r.updated_at) as since
    from public.completion_reports r
    join public.certificates c on c.id = r.certificate_id
    join public.enrollments e on e.id = c.enrollment_id
    where r.status in ('rejected', 'error')
    union all
    select 'refund_requested', f.order_id, o.user_id, f.status, f.amount_cents, null, f.created_at
    from public.refunds f
    join public.orders o on o.id = f.order_id
    where f.status = 'requested'
    union all
    select 'enrollment_blocked', e.id, e.user_id,
           case when e.status = 'active' then 'expired' else e.status end,
           null, null, e.updated_at
    from public.enrollments e
    where public.enrollment_stage(e.status, e.expires_at, false) = 'needs_attention'
    union all
    select 'ticket_open', t.id, t.user_id, t.type, null, null, t.created_at
    from public.tickets t
    where t.status in ('open', 'in_progress')
    union all
    select 'court_due_soon', e.id, e.user_id, e.status, null, e.court_due_date,
           e.court_due_date::timestamptz
    from public.enrollments e
    where e.court_due_date is not null
      and e.court_due_date <= v_today + 7
      and public.enrollment_stage(e.status, e.expires_at, false) in ('studying', 'needs_attention')
  ),
  ranked as (
    select i.*,
           row_number() over (partition by i.kind order by i.since, i.ref_id) as rn,
           count(*) over (partition by i.kind) as total
    from items i
  )
  select x.kind, x.ref_id, x.user_id,
         nullif(trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')), ''),
         coalesce(u.email::text, tk.email),
         x.detail, x.amount_cents, x.due_date, x.since, x.total
  from ranked x
  left join public.profiles p on p.user_id = x.user_id
  left join auth.users u on u.id = x.user_id
  left join public.tickets tk on x.kind = 'ticket_open' and tk.id = x.ref_id
  where x.rn <= v_limit
  order by x.kind, x.rn;
end;
$$;

revoke execute on function public.admin_attention_items(integer) from public, anon;
grant execute on function public.admin_attention_items(integer) to authenticated;
```

Then regenerate the types:

```
scripts/with-stack-lock.sh 'pnpm supabase migration up && pnpm db:types'
```

This needs a running stack. If it is not running, ask the orchestrator; do not start one yourself. Afterwards `src/lib/database.types.ts` should contain `"student_stage": ["registered","studying","needs_attention","completed","reported"]` and the five functions.

New DB test `tests/db/admin-dashboard.db.test.ts`. Imports: `randomUUID`, vitest, `createStudentAccount`, `deleteTestUsers`, `serviceClient`, `signInAsAdmin`, `signInAsStudent` from `../support/users`, and `type Database`, `type Enums` from `@/lib/database.types`. Add `afterAll(deleteTestUsers)`.

1. **"enrollment_stage applies the glossary rule"**. Cases typed as `Array<{ args: Database["public"]["Functions"]["enrollment_stage"]["Args"]; expected: Enums<"student_stage"> }>`:

   | args | expected |
   | --- | --- |
   | `{}` | registered |
   | `{p_status:"refunded", p_expires_at:future}` | registered |
   | `{p_status:"active", p_expires_at:future}` | studying |
   | `{p_status:"active"}` | studying |
   | `{p_status:"active", p_expires_at:past}` | needs_attention |
   | `{p_status:"paused", p_expires_at:future}` | needs_attention |
   | `{p_status:"locked", p_expires_at:future}` | needs_attention |
   | `{p_status:"expired", p_expires_at:past}` | needs_attention |
   | `{p_status:"completed", p_expires_at:past}` | completed |
   | `{p_status:"completed", p_expires_at:past, p_report_accepted:true}` | reported |

   Loop over the cases with one admin client: `rpc("enrollment_stage", c.args)`, expect `error` null and `data` equal to `c.expected`.

2. **"admin RPCs refuse a Student"**. With `signInAsStudent()`, each of these returns a non-null `error`: `admin_student_stages`, `admin_stage_counts`, `admin_daily_activity {p_days:30}`, `admin_attention_items {p_limit:5}`.

3. **"a Student moves through the stages"**.
   - Set up: create a student; `stageOf = async () => (await admin.client.rpc("admin_search_students", { q: student.email, lim: 5, off: 0 })).data?.[0]?.stage`.
   - Expect `"registered"`.
   - Buy, copied from `admin.db.test.ts`: orders insert, then `fulfill_checkout`. Expect `"studying"`.
   - Update the enrollment `status:"paused"`. Expect `"needs_attention"`.
   - Update `status:"completed", completed_at: now`. Expect `"completed"`.
   - Insert a certificate `{enrollment_id, cert_no: \`T-${randomUUID()}\`}` (select id), then a completion report `{certificate_id, status:"accepted"}`. Expect `"reported"`.
   - Also: with `stage_filter: "reported"` the search returns `[student.id]`; with `stage_filter: "studying"` it returns `[]`.

4. **"admin_stage_counts returns five rows in stage order"**: `data.map(r => r.stage)` equals `["registered","studying","needs_attention","completed","reported"]`, and every `students` is ≥ 0.

5. **"admin_daily_activity returns 30 consecutive days ending today (LA)"**:
   - The result has length 30.
   - Each `day` is one day after the previous.
   - The last `day` equals `new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(new Date())`.
   - After a fresh purchase, the last row's `enrollments` is ≥ 1 and its `sales_cents` is ≥ 2499.

6. **"admin_attention_items lists a paused enrollment and a court date due soon"**:
   - Student A buys, then their enrollment is set to `paused`.
   - Student B buys, then gets `court_due_date` = today (LA) + 3 days as `YYYY-MM-DD`.
   - Call `rpc("admin_attention_items", { p_limit: 50 })`.
   - Expect a row `{kind:"enrollment_blocked", ref_id: enrollmentA, detail:"paused"}` and a row `{kind:"court_due_soon", ref_id: enrollmentB}`.
   - Every row's `total` is ≥ the number of rows of its kind.

Verify: `scripts/with-stack-lock.sh 'pnpm vitest run --project db tests/db/admin-dashboard.db.test.ts tests/db/admin.db.test.ts'`, then `pnpm typecheck` (the students page still compiles because `stage_filter` is optional).

### Step 4: nav config, pure helpers, unit tests, messages

Commit: `feat(admin): nav config, stage and dashboard helpers, admin shell messages`

**`src/lib/admin/stages.ts`**:

```ts
import { z } from "zod";
import { Constants, type Enums } from "@/lib/database.types";
export type StudentStage = Enums<"student_stage">;
/** In funnel order, as declared in the `student_stage` Postgres enum. */
export const STUDENT_STAGES = Constants.public.Enums.student_stage;
export const studentStageSchema = z.enum(STUDENT_STAGES);
/** `?stage=` from the URL, or undefined when missing or unknown. */
export function parseStageParam(value: unknown): StudentStage | undefined {
  const r = studentStageSchema.safeParse(value);
  return r.success ? r.data : undefined;
}
```

Test `src/lib/admin/stages.test.ts`:
- `parseStageParam("reported")` is `"reported"`.
- `"bogus"`, `undefined` and `["reported"]` all give `undefined`.
- `STUDENT_STAGES` equals the five values in order.

**`src/lib/admin/dashboard-stats.ts`**: add

```ts
export function reportsWaiting(stats: DashboardStats) {
  const queued = stats.reports_by_status.queued ?? 0;
  const sent = stats.reports_by_status.sent ?? 0;
  return { queued, sent, total: queued + sent };
}
```

Add a test in `dashboard-stats.test.ts`: `{queued:2, sent:3, accepted:9}` gives `{2,3,5}`, and `{}` gives zeros.

**`src/lib/admin/dashboard-view.ts`** (pure, no `server-only`):

```ts
import type { Database } from "@/lib/database.types";
import { STUDENT_STAGES, type StudentStage } from "./stages";
type Fns = Database["public"]["Functions"];
export type AttentionRow = Fns["admin_attention_items"]["Returns"][number];
export type StageCountRow = Fns["admin_stage_counts"]["Returns"][number];
export type ActivityRow = Fns["admin_daily_activity"]["Returns"][number];
export const ATTENTION_KINDS = ["report_failed", "refund_requested", "enrollment_blocked", "ticket_open", "court_due_soon"] as const;
export type AttentionKind = (typeof ATTENTION_KINDS)[number];
export const TICKET_TYPES = ["contact", "bug", "ada", "ai_handoff"] as const;
export function toStageCounts(rows: StageCountRow[]): Record<StudentStage, number>   // zeros for missing stages
export function groupAttention(rows: AttentionRow[]): { kind: AttentionKind; total: number; items: AttentionRow[] }[]   // ATTENTION_KINDS order, drops empty and unknown kinds; total = rows[0].total
export function attentionHref(row: AttentionRow & { kind: AttentionKind }): string
export function attentionViewAllHref(kind: AttentionKind): string | null
export function ticketTypeOf(detail: string): (typeof TICKET_TYPES)[number] | undefined
export function toActivityPoints(rows: ActivityRow[], formatDay: (day: string) => string): { label: string; sales: number; enrollments: number }[]   // sales = sales_cents / 100
```

`attentionHref` per kind:

| Kind | Link |
| --- | --- |
| `report_failed` | `/admin/reporting?status=${detail}` |
| `refund_requested` | `/admin/orders/${ref_id}` (`ref_id` is the order id) |
| `enrollment_blocked` | `/admin/enrollments/${ref_id}` |
| `ticket_open` | `/admin/tickets?status=open` |
| `court_due_soon` | `/admin/students/${user_id}` |

`attentionViewAllHref` per kind:

| Kind | Link |
| --- | --- |
| `report_failed` | `/admin/reporting` |
| `refund_requested` | `/admin/orders?tab=refunds` |
| `enrollment_blocked` | `/admin/students?stage=needs_attention` |
| `ticket_open` | `/admin/tickets?status=open` |
| `court_due_soon` | `null` (the UI shows "{count} more" as plain text) |

Test `src/lib/admin/dashboard-view.test.ts`: each function; `groupAttention` order and dropping; `toStageCounts` filling.

**`src/components/admin/nav.ts`** (no directive; imports lucide):

```ts
import type { LucideIcon } from "lucide-react";
import { BookOpenIcon, BotIcon, ClipboardListIcon, FileCheckIcon, FileTextIcon, LandmarkIcon, LayoutDashboardIcon, LifeBuoyIcon, ListChecksIcon, ReceiptIcon, SettingsIcon, UsersIcon } from "lucide-react";
type NavItemShape = { key: string; href: string; icon: LucideIcon; exact?: boolean; aliases?: readonly string[] };
export const ADMIN_NAV = [
  { group: "overview", items: [{ key: "dashboard", href: "/admin", icon: LayoutDashboardIcon, exact: true }] },
  { group: "people", items: [{ key: "students", href: "/admin/students", icon: UsersIcon }, { key: "enrollments", href: "/admin/enrollments", icon: ClipboardListIcon }] },
  { group: "sales", items: [{ key: "orders", href: "/admin/orders", icon: ReceiptIcon, aliases: ["/admin/refunds"] }] },
  { group: "compliance", items: [{ key: "reporting", href: "/admin/reporting", icon: FileCheckIcon }, { key: "courts", href: "/admin/courts", icon: LandmarkIcon }] },
  { group: "content", items: [{ key: "content", href: "/admin/content", icon: BookOpenIcon }, { key: "questions", href: "/admin/content/questions", icon: ListChecksIcon }, { key: "siteContent", href: "/admin/site-content", icon: FileTextIcon }] },
  { group: "support", items: [{ key: "tickets", href: "/admin/tickets", icon: LifeBuoyIcon }, { key: "ai", href: "/admin/ai", icon: BotIcon }] },
  { group: "system", items: [{ key: "settings", href: "/admin/settings", icon: SettingsIcon }] },
] as const satisfies readonly { group: string; items: readonly NavItemShape[] }[];
export type AdminNavGroupKey = (typeof ADMIN_NAV)[number]["group"];
export type AdminNavKey = (typeof ADMIN_NAV)[number]["items"][number]["key"];
export const ADMIN_NAV_ITEMS: readonly NavItemShape[] = ADMIN_NAV.flatMap((g) => g.items);
export type Crumb = { label: string; href?: string };
export type CrumbLabels = { sections: Record<string, string>; details: string; view: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** The nav href to highlight: the longest matching prefix; `exact` items match only themselves. */
export function activeNavHref(pathname: string, items: readonly Pick<NavItemShape, "href" | "exact" | "aliases">[]): string | null
/** Crumbs from the path. "/admin" alone is "Dashboard"; deeper pages start at their section. A uuid
 *  is "Details" (a link unless last), a last "view" is the view label, other unknown segments
 *  (e.g. "lessons") are skipped. The last crumb has no href. */
export function buildCrumbs(pathname: string, labels: CrumbLabels): Crumb[]
```

`activeNavHref`: strip trailing slashes. For each item and each of `[href, ...aliases]`: a hit is `path === p` when the item is `exact`, otherwise `path === p || path.startsWith(p + "/")`. Keep the longest hit and return that item's `href`.

`buildCrumbs`: split the path into parts. If `parts[0] !== "admin"`, return `[]`. If there is only one part, return `[{ label: sections["/admin"] }]`. Otherwise accumulate the path from `/admin` and, for each later part:

```
label = sections[path] ?? (UUID.test(part) ? details : last ? (part === "view" ? view : details) : undefined)
```

Push `{ label, href: last ? undefined : path }` when `label` is set.

Test `src/components/admin/nav.test.ts`:
- `activeNavHref` with `ADMIN_NAV_ITEMS`:

  | Path | Result |
  | --- | --- |
  | `/admin` | `/admin` |
  | `/admin/` | `/admin` |
  | `/admin/students/<uuid>` | `/admin/students` |
  | `/admin/content/questions` | `/admin/content/questions` |
  | `/admin/content/lessons/<uuid>` | `/admin/content` |
  | `/admin/refunds` | `/admin/orders` |
  | `/admin/contentx` | `null` |

- `buildCrumbs`, using a labels fixture:

  | Path | Crumbs |
  | --- | --- |
  | `/admin` | `[Dashboard]` |
  | `/admin/students` | `[Students]` |
  | `/admin/content/questions` | `[Course content→/admin/content, Question bank]` |
  | `/admin/content/lessons/<uuid>` | `[Course content→/admin/content, Details]` |
  | `/admin/students/<uuid>/view` | `[Students→/admin/students, Details→/admin/students/<uuid>, View as student]` |
  | `/portal` | `[]` |

**`src/i18n/remember-locale.ts`**: move `ONE_YEAR_SECONDS` and `rememberLocale(locale: Locale)` out of `language-switcher-popover.tsx` and export the function. The popover then imports it; its behaviour does not change.

**Messages.** Merge into `"Admin"` in all four files. **Replace `Admin.nav` entirely.** Keep every existing key that is not listed here.

**en**
```json
"nav": {"dashboard":"Dashboard","students":"Students","enrollments":"Enrollments","orders":"Orders & refunds","reporting":"DMV reporting","courts":"Courts","content":"Course content","questions":"Question bank","siteContent":"Site content","tickets":"Support requests","ai":"AI assistant","settings":"Settings"},
"navGroups": {"overview":"Overview","people":"People","sales":"Sales","compliance":"Compliance","content":"Content","support":"Support","system":"System"},
"shell": {"adminTag":"Admin","sidebarLabel":"Sidebar","navLabel":"Admin sections","menuTitle":"Admin navigation","openMenu":"Open navigation","breadcrumbLabel":"Breadcrumb","details":"Details","searchLabel":"Search students","searchPlaceholder":"Name, email, license or citation no.","backToSite":"Back to site","signOut":"Sign out","accountMenu":"Admin menu","notFoundTitle":"Page not found","notFoundBody":"This Admin page does not exist or was removed.","backToDashboard":"Back to Dashboard"},
"stages": {"registered":"Registered","studying":"Studying","needs_attention":"Needs attention","completed":"Completed","reported":"Reported"},
"stageHints": {"registered":"No paid course yet","studying":"Paid, working through the course","needs_attention":"Paused, locked or out of access time","completed":"Passed; completion report not yet accepted","reported":"DMV accepted the completion report"},
"dashboard": { …existing keys…, "subtitle":"What needs doing today, and how the school is doing.","kpiHeading":"Key numbers","sales30":"Sales, last 30 days","enrollments30":"New enrollments, last 30 days","windowHint":"Today: {today} · 7 days: {d7}","passRateHint":"{passed} of {submitted} final exams passed","reportsWaiting":"Completion reports waiting","reportsWaitingHint":"{queued} queued · {sent} sent, not yet accepted","stagesHeading":"Student stages","attentionHeading":"Needs attention","attentionDescription":"Oldest first. Each row links to the page that fixes it.","attentionEmpty":"Nothing needs attention right now.","viewAll":"View all ({count})","more":"{count} more","attentionKinds":{"report_failed":"Completion reports to fix","refund_requested":"Refund requests","enrollment_blocked":"Students who cannot go on","ticket_open":"Open support requests","court_due_soon":"Court due date within 7 days"},"attentionRows":{"reportRejected":"Completion report rejected by the DMV","reportError":"Completion report failed to send","refund":"Refund of {amount} requested","paused":"Paused after failed identity checks","locked":"Locked after failing the final exam","expired":"Out of access time","ticket":"Support request: {type}","courtDue":"Court due {date}","unknownUser":"Unknown student"},"chartHeading":"Last 30 days","chartDescription":"Sales (USD) and new enrollments per day","chartSummary":"{sales} in sales and {enrollments} new enrollments over 30 days.","recentHeading":"Recent students","recentViewAll":"All students","recentEmpty":"No students yet.","stage":"Stage","signedUp":"Signed up" },
"students": { …existing…, "stageFilterLabel":"Filter by stage","stage":"Stage" }
```

**ja**
```json
"nav": {"dashboard":"ダッシュボード","students":"受講者","enrollments":"受講","orders":"注文と返金","reporting":"DMV報告","courts":"裁判所","content":"コース内容","questions":"問題バンク","siteContent":"サイト内容","tickets":"サポート依頼","ai":"AIアシスタント","settings":"設定"},
"navGroups": {"overview":"概要","people":"ユーザー","sales":"売上","compliance":"コンプライアンス","content":"コンテンツ","support":"サポート","system":"システム"},
"shell": {"adminTag":"管理","sidebarLabel":"サイドバー","navLabel":"管理セクション","menuTitle":"管理メニュー","openMenu":"ナビゲーションを開く","breadcrumbLabel":"パンくずリスト","details":"詳細","searchLabel":"受講者を検索","searchPlaceholder":"氏名・メール・免許番号・違反切符番号","backToSite":"サイトに戻る","signOut":"ログアウト","accountMenu":"管理者メニュー","notFoundTitle":"ページが見つかりません","notFoundBody":"この管理ページは存在しないか、削除されました。","backToDashboard":"ダッシュボードに戻る"},
"stages": {"registered":"登録のみ","studying":"受講中","needs_attention":"要対応","completed":"修了","reported":"報告済み"},
"stageHints": {"registered":"有料コース未購入","studying":"支払い済み・受講中","needs_attention":"一時停止・ロック・受講期限切れ","completed":"合格済み・修了報告は未受理","reported":"DMVが修了報告を受理"},
"dashboard": {"subtitle":"今日の対応事項と学校の状況。","kpiHeading":"主要指標","sales30":"売上（過去30日）","enrollments30":"新規受講（過去30日）","windowHint":"今日: {today}・7日間: {d7}","passRateHint":"最終試験 {submitted} 件中 {passed} 件合格","reportsWaiting":"未受理の修了報告","reportsWaitingHint":"送信待ち {queued} 件・送信済み未受理 {sent} 件","stagesHeading":"受講者のステージ","attentionHeading":"要対応","attentionDescription":"古い順。各行から対応ページへ移動できます。","attentionEmpty":"現在、対応が必要な項目はありません。","viewAll":"すべて表示（{count}件）","more":"ほか {count} 件","attentionKinds":{"report_failed":"修正が必要な修了報告","refund_requested":"返金リクエスト","enrollment_blocked":"先へ進めない受講者","ticket_open":"未対応のサポート依頼","court_due_soon":"裁判所の期限まで7日以内"},"attentionRows":{"reportRejected":"DMVが修了報告を却下","reportError":"修了報告の送信に失敗","refund":"{amount} の返金リクエスト","paused":"本人確認の失敗により一時停止","locked":"最終試験不合格によりロック","expired":"受講期限切れ","ticket":"サポート依頼: {type}","courtDue":"裁判所の期限 {date}","unknownUser":"不明な受講者"},"chartHeading":"過去30日間","chartDescription":"日別の売上（USD）と新規受講","chartSummary":"30日間の売上 {sales}、新規受講 {enrollments} 件。","recentHeading":"最近の受講者","recentViewAll":"すべての受講者","recentEmpty":"まだ受講者がいません。","stage":"ステージ","signedUp":"登録日"},
"students": {"stageFilterLabel":"ステージで絞り込み","stage":"ステージ"}
```

**es**
```json
"nav": {"dashboard":"Panel","students":"Estudiantes","enrollments":"Inscripciones","orders":"Pedidos y reembolsos","reporting":"Informes al DMV","courts":"Juzgados","content":"Contenido del curso","questions":"Banco de preguntas","siteContent":"Contenido del sitio","tickets":"Solicitudes de soporte","ai":"Asistente de IA","settings":"Ajustes"},
"navGroups": {"overview":"Resumen","people":"Personas","sales":"Ventas","compliance":"Cumplimiento","content":"Contenido","support":"Soporte","system":"Sistema"},
"shell": {"adminTag":"Admin","sidebarLabel":"Barra lateral","navLabel":"Secciones de administración","menuTitle":"Navegación de administración","openMenu":"Abrir navegación","breadcrumbLabel":"Ruta de navegación","details":"Detalles","searchLabel":"Buscar estudiantes","searchPlaceholder":"Nombre, correo, licencia o n.º de citación","backToSite":"Volver al sitio","signOut":"Cerrar sesión","accountMenu":"Menú de administrador","notFoundTitle":"Página no encontrada","notFoundBody":"Esta página de administración no existe o se eliminó.","backToDashboard":"Volver al panel"},
"stages": {"registered":"Registrado","studying":"Estudiando","needs_attention":"Requiere atención","completed":"Completado","reported":"Reportado"},
"stageHints": {"registered":"Aún sin curso pagado","studying":"Pagado, avanzando en el curso","needs_attention":"Pausado, bloqueado o sin tiempo de acceso","completed":"Aprobado; informe de finalización aún no aceptado","reported":"El DMV aceptó el informe de finalización"},
"dashboard": {"subtitle":"Lo que hay que hacer hoy y cómo va la escuela.","kpiHeading":"Cifras clave","sales30":"Ventas, últimos 30 días","enrollments30":"Nuevas inscripciones, últimos 30 días","windowHint":"Hoy: {today} · 7 días: {d7}","passRateHint":"{passed} de {submitted} exámenes finales aprobados","reportsWaiting":"Informes de finalización pendientes","reportsWaitingHint":"{queued} en cola · {sent} enviados sin aceptar","stagesHeading":"Etapas de los estudiantes","attentionHeading":"Requiere atención","attentionDescription":"Primero lo más antiguo. Cada fila lleva a la página donde se resuelve.","attentionEmpty":"Nada requiere atención ahora mismo.","viewAll":"Ver todo ({count})","more":"{count} más","attentionKinds":{"report_failed":"Informes de finalización por corregir","refund_requested":"Solicitudes de reembolso","enrollment_blocked":"Estudiantes que no pueden continuar","ticket_open":"Solicitudes de soporte abiertas","court_due_soon":"Fecha límite del juzgado en 7 días"},"attentionRows":{"reportRejected":"El DMV rechazó el informe de finalización","reportError":"No se pudo enviar el informe de finalización","refund":"Reembolso de {amount} solicitado","paused":"Pausado tras fallar la verificación de identidad","locked":"Bloqueado tras suspender el examen final","expired":"Sin tiempo de acceso","ticket":"Solicitud de soporte: {type}","courtDue":"Fecha del juzgado: {date}","unknownUser":"Estudiante desconocido"},"chartHeading":"Últimos 30 días","chartDescription":"Ventas (USD) y nuevas inscripciones por día","chartSummary":"{sales} en ventas y {enrollments} nuevas inscripciones en 30 días.","recentHeading":"Estudiantes recientes","recentViewAll":"Todos los estudiantes","recentEmpty":"Aún no hay estudiantes.","stage":"Etapa","signedUp":"Fecha de alta"},
"students": {"stageFilterLabel":"Filtrar por etapa","stage":"Etapa"}
```

**ru**
```json
"nav": {"dashboard":"Обзор","students":"Студенты","enrollments":"Записи","orders":"Заказы и возвраты","reporting":"Отчёты в DMV","courts":"Суды","content":"Контент курса","questions":"Банк вопросов","siteContent":"Контент сайта","tickets":"Запросы в поддержку","ai":"ИИ-ассистент","settings":"Настройки"},
"navGroups": {"overview":"Главное","people":"Люди","sales":"Продажи","compliance":"Соответствие","content":"Контент","support":"Поддержка","system":"Система"},
"shell": {"adminTag":"Админка","sidebarLabel":"Боковая панель","navLabel":"Разделы админки","menuTitle":"Навигация админки","openMenu":"Открыть навигацию","breadcrumbLabel":"Навигационная цепочка","details":"Подробности","searchLabel":"Поиск студентов","searchPlaceholder":"Имя, email, номер прав или штрафа","backToSite":"Вернуться на сайт","signOut":"Выйти","accountMenu":"Меню администратора","notFoundTitle":"Страница не найдена","notFoundBody":"Этой страницы админки нет или она удалена.","backToDashboard":"Вернуться к обзору"},
"stages": {"registered":"Зарегистрирован","studying":"Учится","needs_attention":"Требует внимания","completed":"Завершил","reported":"Передан в DMV"},
"stageHints": {"registered":"Курс ещё не оплачен","studying":"Оплатил и проходит курс","needs_attention":"Приостановлен, заблокирован или истёк доступ","completed":"Сдал; отчёт о завершении ещё не принят","reported":"DMV принял отчёт о завершении"},
"dashboard": {"subtitle":"Что нужно сделать сегодня и как идут дела у школы.","kpiHeading":"Ключевые показатели","sales30":"Продажи за 30 дней","enrollments30":"Новые записи за 30 дней","windowHint":"Сегодня: {today} · 7 дней: {d7}","passRateHint":"Сдано {passed} из {submitted} итоговых экзаменов","reportsWaiting":"Отчёты о завершении в ожидании","reportsWaitingHint":"В очереди: {queued} · отправлено, не принято: {sent}","stagesHeading":"Этапы студентов","attentionHeading":"Требует внимания","attentionDescription":"Сначала самое старое. Каждая строка ведёт на страницу, где это решается.","attentionEmpty":"Сейчас ничего не требует внимания.","viewAll":"Показать все ({count})","more":"Ещё {count}","attentionKinds":{"report_failed":"Отчёты о завершении на исправление","refund_requested":"Запросы на возврат","enrollment_blocked":"Студенты, которые не могут продолжить","ticket_open":"Открытые запросы в поддержку","court_due_soon":"Срок суда в ближайшие 7 дней"},"attentionRows":{"reportRejected":"DMV отклонил отчёт о завершении","reportError":"Не удалось отправить отчёт о завершении","refund":"Запрошен возврат {amount}","paused":"Приостановлен после неудачной проверки личности","locked":"Заблокирован после провала итогового экзамена","expired":"Истёк срок доступа","ticket":"Запрос в поддержку: {type}","courtDue":"Срок в суде: {date}","unknownUser":"Неизвестный студент"},"chartHeading":"Последние 30 дней","chartDescription":"Продажи (USD) и новые записи по дням","chartSummary":"За 30 дней: продажи {sales}, новых записей {enrollments}.","recentHeading":"Недавние студенты","recentViewAll":"Все студенты","recentEmpty":"Студентов пока нет.","stage":"Этап","signedUp":"Дата регистрации"},
"students": {"stageFilterLabel":"Фильтр по этапу","stage":"Этап"}
```

Verify: `pnpm test:unit && pnpm typecheck && pnpm lint` (`tests/unit/messages.test.ts` checks that every en key exists in all locales).

### Step 5: the admin shell

Commit: `feat(admin): sidebar and top bar admin shell with breadcrumb slot`

Client components get every string as a prop, so `CLIENT_NAMESPACES` does not change.

**`src/components/admin/breadcrumb.tsx`** (shared, no directive): `AdminBreadcrumb({ items, label }: { items: Crumb[]; label: string })`.
- Returns `null` when empty.
- Markup: `<nav aria-label={label} className="min-w-0"><ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">`.
- Each `li`: `flex min-w-0 items-center gap-1.5`, plus `max-md:hidden` for every item except the last.
- From the second item on, a separator `<ChevronRightIcon aria-hidden className="size-3.5 shrink-0" />`.
- With an href: `<Link className="truncate hover:text-foreground">`. Without: `<span aria-current="page" className="truncate font-medium text-foreground">`.

**`src/components/admin/path-breadcrumb.tsx`** (`"use client"`): `PathBreadcrumb({ labels, ariaLabel })` renders `<AdminBreadcrumb items={buildCrumbs(usePathname(), labels)} label={ariaLabel} />`, with `usePathname` from `@/i18n/navigation`.

**`src/components/admin/crumb-labels.ts`** (`import "server-only"`): `async function getCrumbLabels(locale): Promise<CrumbLabels>`.
- `sections`: `/admin` → `t("nav.dashboard")`; each `ADMIN_NAV_ITEMS` href → `t(\`nav.${key}\`)`; each alias → the same label.
- `details: t("shell.details")`; `view: t("students.viewAs")`.

**`src/components/admin/derived-breadcrumb.tsx`** (server): `async function DerivedBreadcrumb()`. It gets `locale = await getLocale()` and renders `<PathBreadcrumb labels={await getCrumbLabels(locale)} ariaLabel={t("shell.breadcrumbLabel")} />`.

**Breadcrumb slot**, under `src/app/[locale]/admin/@breadcrumb/`:

| File | Content |
| --- | --- |
| `default.tsx`, `page.tsx`, `[...segments]/page.tsx` | Each is `export default function X() { return <DerivedBreadcrumb />; }` and takes no props. The catch-all stops a stale crumb after soft navigation; `default` covers hard loads. |
| `content/lessons/[id]/page.tsx` | Override, described below. |
| `students/[userId]/page.tsx` | Override, described below. |

Lesson override, `({ params }: PageProps<"/[locale]/admin/content/lessons/[id]">)`:
1. `{ locale, id } = await params`.
2. Return `null` if the locale is invalid, or if `(await getCurrentAccount())?.role !== "admin"`.
3. If `z.uuid().safeParse(id)` succeeds, run `createServiceClient().from("lessons").select("title").eq("id", id).maybeSingle()`.
4. `const titles = (data?.title ?? {}) as Record<string, string>`.
5. Render `<AdminBreadcrumb label={t("shell.breadcrumbLabel")} items={[{ label: t("nav.content"), href: "/admin/content" }, { label: titles[locale] || titles.en || t("shell.details") }]} />`.

Student override: same shape with `PageProps<"/[locale]/admin/students/[userId]">`. Select `first_name, last_name` from `profiles` by `user_id`. Items: `[{ label: t("nav.students"), href: "/admin/students" }, { label: name || t("shell.details") }]`.

**New `src/app/[locale]/admin/default.tsx`**: `export default function AdminDefault() { notFound(); }`. This is the fallback for the `children` slot when only the breadcrumb catch-all matches.

**New `src/app/[locale]/admin/not-found.tsx`** (shown inside the shell, for Admins only):
- Uses `useTranslations("Admin")`.
- `<div className="flex flex-col items-start gap-3 py-16">` containing `<p className="text-xs font-medium text-muted-foreground">404</p>`, `<h1 className="text-2xl font-semibold tracking-tight">{t("shell.notFoundTitle")}</h1>`, `<p className="text-muted-foreground">{t("shell.notFoundBody")}</p>`, and `<Link href="/admin" className={adminButtonVariants({ variant: "outline", size: "sm" })}>{t("shell.backToDashboard")}</Link>`.

**Delete** `src/app/[locale]/admin/[section]/page.tsx`. It was a stub; every section now exists.

**`src/components/admin/sidebar-nav.tsx`** (`"use client"`): `AdminSidebarNav({ label, groupLabels, itemLabels }: { label: string; groupLabels: Record<AdminNavGroupKey, string>; itemLabels: Record<AdminNavKey, string> })`.
- `active = activeNavHref(usePathname(), ADMIN_NAV_ITEMS)`.
- `<nav aria-label={label} className="flex-1 overflow-y-auto px-2 py-3">`.
- Per group: `<div className="mb-3 last:mb-0"><p className="px-2 pb-1 text-xs font-medium text-muted-foreground">{groupLabels[g.group]}</p><ul className="flex flex-col gap-0.5">`.
- Per item: `<Link href aria-current={item.href === active ? "page" : undefined} className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"><Icon aria-hidden className="size-4 shrink-0" />{label}</Link>`.

**`src/components/admin/sidebar.tsx`** (async server): `AdminSidebar({ locale, account }: { locale: Locale; account: CurrentAccount })`. Build the label records from `t("nav.*")` and `t("navGroups.*")` by mapping over `ADMIN_NAV` (a type assertion `as Record<…>` is fine). Markup:
- Root: `<div className="flex h-full flex-col">`.
- Logo: `<Link href="/admin" className="flex h-14 shrink-0 items-center gap-2 border-b px-4">` containing `<span aria-hidden className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground"><SignpostIcon className="size-4" /></span>`, `<span className="text-sm font-semibold">{siteConfig.shortName}</span>` and `<span className="rounded border px-1.5 py-px text-[11px] font-medium text-muted-foreground">{t("shell.adminTag")}</span>`.
- `<AdminSidebarNav label={t("shell.navLabel")} … />`.
- Footer: `<div className="shrink-0 border-t p-3">` containing:
  - `<div className="px-2 pb-2"><p className="truncate text-sm font-medium">{\`${account.firstName} ${account.lastName}\`.trim() || account.email}</p><p className="truncate text-xs text-muted-foreground">{account.email}</p></div>`
  - `<Link href="/" className={adminButtonVariants({ variant: "ghost", size: "sm", className: "w-full justify-start" })}><ArrowLeftIcon aria-hidden />{t("shell.backToSite")}</Link>`
  - `<form action={signOut.bind(null, locale)}><AdminButton type="submit" variant="ghost" size="sm" className="w-full justify-start"><LogOutIcon aria-hidden />{t("shell.signOut")}</AdminButton></form>`

**`src/components/admin/mobile-nav.tsx`** (`"use client"`): `AdminMobileNav({ openLabel, title, children })`.
- `const [open, setOpen] = useState(false)`.
- `<Sheet open onOpenChange={setOpen}>`.
- Trigger: `<SheetTrigger asChild><AdminButton variant="ghost" size="icon-sm" className="lg:hidden" aria-label={openLabel}><MenuIcon aria-hidden /></AdminButton></SheetTrigger>`.
- Content: `<SheetContent side="left" aria-describedby={undefined} className="w-72 max-w-[85vw] gap-0 bg-sidebar p-0 sm:max-w-72" onClickCapture={(e) => { if (e.target instanceof Element && e.target.closest("a[href]")) setOpen(false); }}>` containing `<SheetTitle className="sr-only">{title}</SheetTitle>{children}`.
- No effects.

**`src/components/admin/theme-toggle.tsx`** (`"use client"`): `AdminThemeToggle({ label })`. Reuse the `useTheme` / `useSyncExternalStore` "mounted" pattern from `layout/theme-toggle.tsx`:

```tsx
<AdminButton type="button" variant="ghost" size="icon-sm" role="switch" aria-checked={isDark} aria-label={label} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
  <SunIcon aria-hidden className="dark:hidden" />
  <MoonIcon aria-hidden className="hidden dark:block" />
</AdminButton>
```

The icons are switched by CSS, so there is no hydration mismatch.

**`src/components/admin/language-menu.tsx`** (`"use client"`): `AdminLanguageMenu({ label })`. It uses `useLocale`, `usePathname` / `useRouter` (from `@/i18n/navigation`) and `useTransition`.

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <AdminButton variant="ghost" size="sm" className="gap-1.5 px-2">
      <LanguagesIcon aria-hidden />
      <span>{languages[current].shortCode}</span>
      <span className="sr-only">, {label}</span>
    </AdminButton>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-44">
    {/* one item per routing.locales entry */}
    <DropdownMenuItem key={l} lang={l} onSelect={() => { rememberLocale(l); startTransition(async () => { await saveUiLocale(l); router.push(pathname, { locale: l }); }); }}>
      <span className="flex-1">{languages[l].nativeName}</span>
      {/* <CheckIcon aria-hidden /> only on the current locale */}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**`src/components/admin/account-menu.tsx`** (`"use client"`): `AdminAccountMenu({ firstName, initials, name, email, labels: { menu, backToSite, signOut } })`.
- The trigger must contain the first name as visible text, because the e2e `signIn` helper looks for it (section 0):
  ```tsx
  <AdminButton variant="ghost" size="sm" className="gap-2 px-1.5">
    <span aria-hidden className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{initials}</span>
    <span className="max-w-28 truncate max-sm:sr-only">{firstName}</span>
    <ChevronDownIcon aria-hidden className="size-3.5 text-muted-foreground max-sm:hidden" />
  </AdminButton>
  ```
- Content: `<DropdownMenuContent align="end" aria-label={labels.menu} className="w-56">` with:
  - `DropdownMenuLabel`: name (`text-sm font-medium truncate`) and email (`text-xs text-muted-foreground truncate`)
  - separator
  - `DropdownMenuItem asChild`: `<Link href="/"><ArrowLeftIcon />{backToSite}</Link>`
  - `DropdownMenuItem disabled={pending} onSelect={() => startTransition(() => signOut(locale))}`: `<LogOutIcon />{signOut}`. `locale` comes from `useLocale()`.

**`src/components/admin/search-form.tsx`** (server): `AdminSearch({ action, label, placeholder, className })`, built on `next/form`:

```tsx
<Form action={action} role="search" className={cn("relative", className)}>
  <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
  <AdminInput type="search" name="q" aria-label={label} placeholder={placeholder} maxLength={100} className="h-8 pl-8" />
</Form>
```

The param name `q` matches what the students page reads.

**`src/components/admin/top-bar.tsx`** (async server): `AdminTopBar({ locale, account, breadcrumb, mobileNav })`.
- Root: `<header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur lg:px-6">`.
- Children in order:
  1. `{mobileNav}`
  2. `<div className="min-w-0 flex-1">{breadcrumb}</div>`
  3. `<div className="hidden flex-1 justify-center md:flex"><AdminSearch action={getPathname({ href: "/admin/students", locale })} label={t("shell.searchLabel")} placeholder={t("shell.searchPlaceholder")} className="w-full max-w-sm" /></div>`
  4. `<div className="flex shrink-0 items-center justify-end gap-1 md:flex-1">` containing:
     - `<Link href="/admin/students" aria-label={t("shell.searchLabel")} className={adminButtonVariants({ variant: "ghost", size: "icon-sm", className: "md:hidden" })}><SearchIcon aria-hidden /></Link>`
     - `<AdminLanguageMenu label={tLang("label", { language: languages[locale].nativeName })} />`
     - `<AdminThemeToggle label={tHeader("darkTheme")} />`
     - `<AdminAccountMenu firstName={account.firstName} initials={initialsOf(account)} name={…} email={account.email} labels={{ menu: t("shell.accountMenu"), backToSite: t("shell.backToSite"), signOut: t("shell.signOut") }} />`
- Translations: `tLang` uses the existing `LanguageSwitcher` namespace and `tHeader` the existing `Header` namespace.

**`src/components/admin/admin-shell.tsx`**: rewrite it and remove `ADMIN_SECTIONS`. Signature: `AdminShell({ locale, account, breadcrumb, children }: { locale: Locale; account: CurrentAccount; breadcrumb: React.ReactNode; children: React.ReactNode })`.

```tsx
const sidebar = <AdminSidebar locale={locale} account={account} />;
<div className="admin-shell flex min-h-dvh flex-1 bg-background text-sm text-foreground">
  <SkipLink />
  <aside aria-label={t("shell.sidebarLabel")} className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block">{sidebar}</aside>
  <div className="flex min-w-0 flex-1 flex-col">
    <AdminTopBar locale={locale} account={account} breadcrumb={breadcrumb}
      mobileNav={<AdminMobileNav openLabel={t("shell.openMenu")} title={t("shell.menuTitle")}>{sidebar}</AdminMobileNav>} />
    <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 px-4 py-6 outline-none lg:px-8">
      <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
    </main>
  </div>
</div>
```

**`src/app/[locale]/admin/layout.tsx`**: signature `({ children, breadcrumb, params }: LayoutProps<"/[locale]/admin">)`. `breadcrumb` appears in the type after `next typegen`. Keep the auth check and the locale check exactly as they are, then `return <AdminShell locale={locale} account={account} breadcrumb={breadcrumb}>{children}</AdminShell>;`. `account` is already narrowed by the role check. Keep the `metadata` (`robots` noindex).

Verify: `pnpm typecheck && pnpm lint && pnpm test:unit`

### Step 6: stage filter on the students list

Commit: `feat(admin): filter and label Students by stage`

Changes in `src/app/[locale]/admin/students/page.tsx`:
- `const stage = parseStageParam(sp.stage);`
- RPC call: `rpc("admin_search_students", { q, stage_filter: stage, lim: PAGE_SIZE + 1, off })`.
- Add `tStages = getTranslations({ locale, namespace: "Admin.stages" })` to the existing `Promise.all`.
- Inside the existing form: `{stage ? <input type="hidden" name="stage" value={stage} /> : null}`.
- After the form, add the stage chips: `<nav aria-label={t("stageFilterLabel")} className="mt-4 flex flex-wrap gap-1.5">` with one "All" link and one link per `STUDENT_STAGES` entry, each `href={{ pathname: "/admin/students", query: { ...(q ? { q } : {}), ...(s ? { stage: s } : {}) } }}`.
  - Chip classes: `inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium hover:bg-accent aria-[current=page]:border-primary aria-[current=page]:bg-accent`.
  - `aria-current="page"` on the active chip ("All" when there is no stage).
  - Labels: `tc("all")` and `tStages(s)`.
- `DataTable extraParams={stage ? { stage } : undefined}`.
- New column after Email: `{ header: t("stage"), cell: (r) => <StageBadge stage={r.stage} /> }`.

New **`src/components/admin/stage-badge.tsx`**: `useTranslations("Admin.stages")` and `TONE: Record<StudentStage, AdminBadgeTone> = { registered: "neutral", studying: "info", needs_attention: "warning", completed: "success", reported: "done" }`, rendering `<AdminBadge tone={TONE[stage]}>{t(stage)}</AdminBadge>`.

Verify: `pnpm typecheck && pnpm lint`

### Step 7: chart primitive

Commit: `build(admin): add recharts and the admin chart primitive`

`pnpm add recharts@3.10.1 react-is@^19.0.0`. recharts 3 declares `react-is` as a peer dependency (checked in the local pnpm store).

New `src/components/admin/ui/chart.tsx` (`"use client"`), shaped like shadcn's but slim and safe with recharts 3 types:

```tsx
"use client";
import * as React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
export type ChartConfig = Record<string, { label: string; color: string }>;
const ChartContext = React.createContext<ChartConfig | null>(null);
function useChartConfig(): ChartConfig { const c = React.useContext(ChartContext); if (!c) throw new Error("Chart parts must be inside <ChartContainer>"); return c; }
export function ChartContainer({ config, className, children, ...props }: Omit<React.ComponentProps<"div">, "children"> & { config: ChartConfig; children: React.ReactElement }) {
  const style = Object.fromEntries(Object.entries(config).map(([k, v]) => [`--color-${k}`, v.color])) as React.CSSProperties;
  return (
    <ChartContext.Provider value={config}>
      <div data-slot="chart" style={style} className={cn("h-64 w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border [&_.recharts-surface]:outline-hidden", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}
export const ChartTooltip = Tooltip;
type TooltipEntry = { dataKey?: unknown; value?: unknown };
export function ChartTooltipContent({ active, payload, label, formatters }: { active?: boolean; payload?: readonly TooltipEntry[]; label?: string | number; formatters?: Partial<Record<string, (value: number) => string>> }) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;
  return (
    <div className="grid min-w-32 gap-1 rounded-md border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md">
      {label !== undefined ? <p className="font-medium">{label}</p> : null}
      {payload.map((entry) => {
        const key = typeof entry.dataKey === "string" ? entry.dataKey : "";
        const item = config[key];
        if (!item) return null;
        const value = Number(entry.value ?? 0);
        return (
          <div key={key} className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item.color }} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-medium tabular-nums">{formatters?.[key]?.(value) ?? String(value)}</span>
          </div>
        );
      })}
    </div>
  );
}
```

Verify: `pnpm typecheck && pnpm lint`

### Step 8: Dashboard page

Commit: `feat(admin): dashboard with KPIs, student stages, needs-attention list, 30-day chart and recent students`

**`src/lib/admin/dashboard.ts`** (`import "server-only"`): `loadDashboard()`.
- Create the client with `createClient()` (the Admin's own session; every RPC checks `is_admin()` itself).
- Run in `Promise.all`:
  - `rpc("admin_dashboard_stats")`
  - `rpc("admin_stage_counts")`
  - `rpc("admin_attention_items", { p_limit: 5 })`
  - `rpc("admin_daily_activity", { p_days: 30 })`
  - `rpc("admin_search_students", { q: "", lim: 5, off: 0 })`
- For each result with `error`: `throw new Error(\`admin dashboard: ${error.message}\`)`.
- Parse the stats with `dashboardStatsSchema.safeParse`. On failure, return `null` (the page calls `notFound()`, as it does today).
- Return `{ stats, stageCounts: toStageCounts(…), attention: groupAttention(…), activity, recent }`.

**`src/components/admin/dashboard/kpi-card.tsx`**: `KpiCard({ label, value, hint, icon: Icon, href }: { …; icon: LucideIcon; href?: string })`.
- Body: `<AdminCard className="p-4">` containing `<div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-muted-foreground">{label}</p><Icon aria-hidden className="size-4 text-muted-foreground" /></div>`, `<p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>` and the hint `<p className="mt-1 text-xs text-muted-foreground">`.
- When `href` is set, wrap the card in `<Link href className="rounded-lg transition-colors hover:[&>div]:border-primary/60">`.

**`src/components/admin/dashboard/stage-cards.tsx`**: `StageCards({ counts }: { counts: Record<StudentStage, number> })`, server, using `useTranslations("Admin")`.
- `<section aria-labelledby="dash-stages">` with `<h2 id="dash-stages" className="mb-3 text-base font-semibold">{t("dashboard.stagesHeading")}</h2>` and `<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">`.
- Per stage: `<li><Link href={\`/admin/students?stage=${s}\`} className="flex h-full flex-col rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-primary/60 hover:bg-accent/40">` containing:
  - `<span className="flex items-center justify-between gap-2 text-sm font-medium">{t(\`stages.${s}\`)}<Icon aria-hidden className="size-4 text-muted-foreground" /></span>`
  - `<span className="mt-2 text-2xl font-semibold tabular-nums">` — add `text-amber-700 dark:text-amber-400` when the stage is `needs_attention` and the count is above 0
  - `<span className="mt-1 text-xs text-muted-foreground">{t(\`stageHints.${s}\`)}</span>`
- Icons: registered `UserPlusIcon`, studying `BookOpenIcon`, needs_attention `TriangleAlertIcon`, completed `GraduationCapIcon`, reported `BadgeCheckIcon`.

**`src/components/admin/dashboard/attention-list.tsx`**: async server `AttentionList({ locale, groups, now })`. Translations: `getTranslations("Admin")`, `getTranslations("Admin.tickets")` and `getFormatter({ locale })`.
- Wrapper: `<AdminCard>` with header `AdminCardTitle` "Needs attention" plus the description, then `AdminCardContent className="flex flex-col gap-5"`.
- Empty state: `<p className="flex items-center gap-2 text-sm text-muted-foreground"><CircleCheckIcon aria-hidden className="size-4 text-emerald-600" />{t("dashboard.attentionEmpty")}</p>`.
- Per group:
  - `<h3 className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">{t(\`dashboard.attentionKinds.${kind}\`)}<AdminBadge>{total}</AdminBadge></h3>`, then `<ul className="divide-y">`.
  - Row: `<li><Link href={attentionHref(row)} className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-muted/50">` containing:
    - `<KindIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />`
    - `<span className="min-w-0 flex-1"><span className="block truncate font-medium">{what}</span><span className="block truncate text-xs text-muted-foreground">{who}</span></span>`
    - `<time dateTime={row.since} className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums">{age}</time>`
    - `<ChevronRightIcon aria-hidden className="size-4 shrink-0 text-muted-foreground" />`
  - After the rows, if `total > items.length`: a "View all" link (`t("dashboard.viewAll", { count: total })`, `className="mt-1 inline-block text-xs font-medium text-link hover:underline"`). For `court_due_soon` it is plain text `t("dashboard.more", { count: total - items.length })`.
- Kind icons: report_failed `ShieldAlertIcon`, refund_requested `Undo2Icon`, enrollment_blocked `TriangleAlertIcon`, ticket_open `LifeBuoyIcon`, court_due_soon `CalendarClockIcon`.
- **what**, by kind:

  | Kind | Text |
  | --- | --- |
  | `report_failed` | `detail === "rejected"` ? `attentionRows.reportRejected` : `attentionRows.reportError` |
  | `refund_requested` | `attentionRows.refund { amount: formatUsd(row.amount_cents ?? 0, locale) }` |
  | `enrollment_blocked` | `attentionRows.paused` / `locked` / `expired` by `detail` |
  | `ticket_open` | `attentionRows.ticket { type: ticketTypeOf(detail) ? tTickets(\`types.${type}\`) : detail }` |
  | `court_due_soon` | `attentionRows.courtDue { date: format.dateTime(new Date(\`${row.due_date}T00:00:00Z\`), { dateStyle: "medium", timeZone: "UTC" }) }` |

- **who**: `row.user_name || row.user_email || t("dashboard.attentionRows.unknownUser")`.
- **age**: `format.relativeTime(new Date(row.since), now)` (for a court due date this reads "in 3 days").

**`src/components/admin/dashboard/activity-chart.tsx`** (`"use client"`): `ActivityChart({ points, locale, salesLabel, enrollmentsLabel })`.
- `usd = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 })`.
- `config = { sales: { label: salesLabel, color: "var(--chart-1)" }, enrollments: { label: enrollmentsLabel, color: "var(--chart-2)" } } satisfies ChartConfig`.
- Legend above the chart: `<div className="mb-2 flex gap-4 text-xs text-muted-foreground">` with swatches `<span aria-hidden className="size-2.5 rounded-[2px]" style={{ background: c.color }} />`.
- Chart:
  ```tsx
  <ChartContainer config={config}>
    <ComposedChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
      <YAxis yAxisId="sales" width={56} tickLine={false} axisLine={false} tickFormatter={(v: number) => usd.format(v)} />
      <YAxis yAxisId="enrollments" orientation="right" width={32} allowDecimals={false} tickLine={false} axisLine={false} />
      <ChartTooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltipContent formatters={{ sales: (v) => usd.format(v) }} />} />
      <Bar yAxisId="sales" dataKey="sales" fill="var(--color-sales)" radius={[3, 3, 0, 0]} maxBarSize={18} />
      <Line yAxisId="enrollments" dataKey="enrollments" type="monotone" stroke="var(--color-enrollments)" strokeWidth={2} dot={false} />
    </ComposedChart>
  </ChartContainer>
  ```
- Do not wrap the chart in `aria-hidden`: recharts' accessibility layer is focusable.

**`src/components/admin/dashboard/recent-students.tsx`**: async server `RecentStudents({ locale, rows })`.
- `<AdminCard>` with header: title `dashboard.recentHeading` and `<Link href="/admin/students" className="text-xs font-medium text-link hover:underline">{t("dashboard.recentViewAll")}</Link>`.
- Content `p-0`: `AdminTable` with columns `students.name` (`Link` to `/admin/students/${user_id}`, `font-medium hover:underline`), `students.email`, `dashboard.stage` (`StageBadge`), and `dashboard.signedUp` (`format.dateTime(new Date(created_at), { dateStyle: "medium", timeZone: "America/Los_Angeles" })`).
- Empty: `<p className="p-4 text-sm text-muted-foreground">{t("dashboard.recentEmpty")}</p>`.

**`src/app/[locale]/admin/page.tsx`**: rewrite. Keep `generateMetadata` and the locale guard.
- `const data = await loadDashboard(); if (!data) notFound();`
- `const now = new Date();`
- `const w = reportsWaiting(stats); const pass = passRatePct(stats);`
- `points = toActivityPoints(data.activity, (day) => format.dateTime(new Date(\`${day}T00:00:00Z\`), { month: "short", day: "numeric", timeZone: "UTC" }))`

Layout:

```tsx
<div className="flex flex-col gap-6">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">{t("nav.dashboard")}</h1>
    <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
  </div>
  <section aria-labelledby="dash-kpis">
    <h2 id="dash-kpis" className="sr-only">{t("dashboard.kpiHeading")}</h2>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard icon={DollarSignIcon} label={t("dashboard.sales30")} value={formatUsd(s.sales_cents.d30, locale)} hint={t("dashboard.windowHint", { today: formatUsd(s.sales_cents.today, locale), d7: formatUsd(s.sales_cents.d7, locale) })} />
      <KpiCard icon={ClipboardListIcon} label={t("dashboard.enrollments30")} value={format.number(s.enrollments.d30)} hint={t("dashboard.windowHint", { today: format.number(s.enrollments.today), d7: format.number(s.enrollments.d7) })} />
      <KpiCard icon={PercentIcon} label={t("dashboard.passRate")} value={pass === null ? t("dashboard.noData") : `${pass}%`} hint={t("dashboard.passRateHint", { passed: s.exam_passed, submitted: s.exam_submitted })} />
      <KpiCard icon={SendIcon} href="/admin/reporting" label={t("dashboard.reportsWaiting")} value={format.number(w.total)} hint={t("dashboard.reportsWaitingHint", { queued: w.queued, sent: w.sent })} />
    </div>
  </section>
  <StageCards counts={data.stageCounts} />
  <AttentionList locale={locale} groups={data.attention} now={now} />
  <div className="grid gap-6 xl:grid-cols-3">
    <AdminCard className="xl:col-span-2">
      <AdminCardHeader><div><AdminCardTitle>{t("dashboard.chartHeading")}</AdminCardTitle><AdminCardDescription>{t("dashboard.chartDescription")}</AdminCardDescription></div></AdminCardHeader>
      <AdminCardContent>
        <p className="sr-only">{t("dashboard.chartSummary", { sales: formatUsd(totalCents, locale), enrollments: totalEnrollments })}</p>
        <ActivityChart points={points} locale={locale} salesLabel={t("dashboard.sales")} enrollmentsLabel={t("dashboard.newEnrollments")} />
      </AdminCardContent>
    </AdminCard>
    <RecentStudents locale={locale} rows={data.recent} />
  </div>
</div>
```

Here `s = data.stats`, and `totalCents` / `totalEnrollments` are sums over `data.activity`. Keep the h1 text "Dashboard": the e2e test checks it.

Delete `src/components/admin/stat-card.tsx`; the old dashboard was its only user.

Verify: `pnpm typecheck && pnpm lint && pnpm test:unit`

### Step 9: e2e (the orchestrator runs this)

Commit: `test(e2e): admin shell has its own frame and stage cards filter Students`

Add to `tests/e2e/portal-and-admin.spec.ts`:

```ts
test("the Admin shell has its own frame and stage cards open the Students list", async ({ page }) => {
  const admin = await createAdminAccount({ firstName: "Hedy" });
  await signIn(page, admin);
  await page.goto("/admin");
  const nav = page.getByRole("navigation", { name: "Admin sections" });
  await expect(nav.getByRole("link", { name: "Dashboard" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Support requests" })).toHaveAttribute("href", "/admin/tickets");
  await expect(page.getByRole("contentinfo")).toHaveCount(0);
  await page.getByRole("main").getByRole("link", { name: /^Registered\b/ }).click();
  await expect(page).toHaveURL(/\/admin\/students\?stage=registered$/);
  await expect(nav.getByRole("link", { name: "Students", exact: true })).toHaveAttribute("aria-current", "page");
});
```

The implementer runs `pnpm lint && pnpm typecheck`. The orchestrator builds, then runs, one at a time:

```
scripts/with-stack-lock.sh 'pnpm playwright test tests/e2e/portal-and-admin.spec.ts --project chromium'
```

Recommended as well, because they are affected by the route move and the new shell:

```
scripts/with-stack-lock.sh 'pnpm playwright test tests/e2e/not-found.spec.ts tests/e2e/page-frame.spec.ts tests/e2e/accessibility-and-theme.spec.ts --project chromium'
scripts/with-stack-lock.sh 'pnpm playwright test tests/e2e/axe-sweep.spec.ts -g "Admin dashboard" --project chromium'
```

**Existing assertions the redesign could break.** None needs replacing if the plan is followed:

| Assertion | Why it keeps passing |
| --- | --- |
| `signIn()`: banner button named after the first name ("Ada") | Admins land on `/admin`; the admin `<header>` account button shows the first name as visible text |
| "an Admin reaches the Admin area": h1 "Dashboard" and noindex | The h1 text is kept; admin `metadata.robots` is kept |
| "a Student / a Visitor gets the 404 page on the Admin area": heading "This page took a wrong turn" | `[locale]/not-found.tsx` renders `NotFoundContent` inside `SiteFrame` |
| `axe-sweep`, Admin: `/admin`, `/admin/students`, `/admin/orders` | Landmark labels are unique (aside "Sidebar", nav "Admin sections", nav "Breadcrumb", one banner, one main); muted text is #636363 (≥5.4:1 on #f5f5f5) |

## 3. Risks and how each is handled

| Risk | How it is handled |
| --- | --- |
| Imports break in the route move | No code imports app files by path. `(auth)` relative imports move with it. `pnpm typecheck` catches anything else. |
| Route types | Keys are URLs, so no `PageProps` changes. `(site)/layout.tsx` uses `LayoutProps<"/[locale]">`; typegen resolves the group to `/[locale]`. Stale `.next/types` are rewritten by `next typegen` inside `pnpm typecheck`. Fallback if typecheck rejects it: type the props as `{ children: React.ReactNode; params: Promise<{ locale: string }> }`. |
| `revalidatePath` with a route pattern | Updated to include `(site)`, as the Next docs require. |
| Which 404 shows | `notFound()` in the admin layout goes to the *parent* boundary, `[locale]/not-found.tsx`, which draws the site frame itself. `notFound()` in admin pages goes to `admin/not-found.tsx`, inside the shell. `(site)` pages go to `(site)/not-found.tsx`. |
| Frame pieces left in the root layout | All moved into `SiteFrame`: help widget, assistant, consent and analytics (PostHog through `CookieConsent`). The Sentry `instrumentation-client.ts` stays global; it is consent-gated error reporting, not analytics. |
| Parallel `@breadcrumb` slot | `default.tsx` exists (Next 16 requires it). The catch-all page prevents a stale crumb after soft navigation. `admin/default.tsx` returns `notFound()` for unmatched `children`. Override pages return `null` for non-Admins (no throw) and read data with the service client only after the role check. If the validator rejects `PageProps` on a slot page, type `params` by hand. |
| Migration ordering | Fixed file name `20261127110000_…`. If you need `pnpm db:new` at all, rename its output. |
| Recreating `admin_search_students` | `drop` + `create`. The input is named `stage_filter` to avoid a clash with the output column. The existing call `{q, lim, off}` and `tests/db/admin.db.test.ts` still work. |
| Speed | `admin_student_stages()` computes every Student on every call. Fine at demo scale; add an index or materialize later. |
| Hydration | Theme icons are switched by CSS. The chart is client-only (`ResponsiveContainer` renders nothing on the server). All dates are formatted on the server with an explicit `timeZone`. Menus are Radix with React 19 `useId`. |
| Portals | Palette tokens hang off `html:has(.admin-shell)`, so sheets and menus match. |
| Old admin pages | Still use `ui/*` pill buttons and 22px cards (accepted until restyled). Bare inputs and `.lms-table` get compact compat styles in the reference layer, below utilities. |
| RAM | No builds or servers in steps 1–8. Only lint, typecheck, unit tests, and DB tests under the stack lock. |

## 4. Facts I could not verify, and settled points that need your decision

1. **Theme default.** `ThemeProvider` is `defaultTheme="system"`, not light, and `next-themes` cannot be nested for admin alone. The plan does not change it. Admins on a dark OS will see dark mode. Making it light everywhere would change the public site.
2. **Partial refunds.** Any processed refund, 50% included, sets the enrollment to `refunded`, which the settled rule maps to Registered. GLOSSARY.md says Registered means a *full* refund. I followed the settled rule.
3. **Overdue but still `active` enrollments** are counted as Needs attention ("out of access time"). The plain mapping "active → Studying" would ignore the lazy expiry. Say if you want them as Studying.
4. **Time windows differ.** The chart uses America/Los_Angeles days; the existing KPI 30-day window is a rolling UTC window. The totals can differ slightly.
5. **Next typegen (not run).** I did not run typegen to confirm that a group layout gets the `"/[locale]"` key and that slot pages accept `PageProps` of the matching child route. This is based on reading `route-types-utils.js`; the fallbacks are listed in section 3.
6. **shadcn `add chart` (not run).** I believe it pulls `card` and edits `--chart-*` variables, which is why I avoided it.
7. **recharts 3 details.** recharts 3's accessibility layer output and its effect on axe are not tested. I also did not confirm that `title`/`desc` props exist; the plan does not use them.
8. **`react-is@^19`** should resolve next to React 19.3.0; not tested.
9. **`next/form`** with a locale-prefixed action string (`/ru/admin/students`) should do a client navigation; not tested.
10. **`pnpm db:types`** needs the local stack running, and I did not check which `supabase gen types` defaults the script uses.
11. **Open support requests** count only `tickets.status = 'open'`; `in_progress` is excluded.

### Critical files for implementation
- /home/usmonov/projects/mirai-clone/src/app/[locale]/layout.tsx (split into `SiteFrame` + `(site)/layout.tsx`)
- /home/usmonov/projects/mirai-clone/src/app/[locale]/admin/layout.tsx and /home/usmonov/projects/mirai-clone/src/components/admin/admin-shell.tsx
- /home/usmonov/projects/mirai-clone/supabase/migrations/20261127110000_admin_dashboard.sql (new) and /home/usmonov/projects/mirai-clone/src/lib/database.types.ts
- /home/usmonov/projects/mirai-clone/src/app/[locale]/admin/page.tsx and /home/usmonov/projects/mirai-clone/src/app/[locale]/admin/students/page.tsx
- /home/usmonov/projects/mirai-clone/src/styles/admin.css (new), /home/usmonov/projects/mirai-clone/messages/{en,ja,es,ru}.json, /home/usmonov/projects/mirai-clone/tests/e2e/portal-and-admin.spec.ts
