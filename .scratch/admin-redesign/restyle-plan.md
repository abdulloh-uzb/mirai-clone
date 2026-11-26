# Plan: Admin redesign, phase 2: restyle every other Admin page

Phase 1 (the shell, palette, primitives and Dashboard, see `plan.md` and ADR 0005) is committed on `lms`. This phase makes every other Admin page look like it belongs to the same panel as the Dashboard. **It is a visual and structural restyle only.**

## 0. Ground rules for the coding agent (read first)

- **Change nothing else.** Routes, server actions, data queries, `searchParams` handling, form field `name`s, hidden inputs, `required`/`min`/`max` attributes, `aria-label`s, `generateMetadata` and the `window.confirm` prompts all stay exactly as they are. If a step seems to need a behavior change, stop and leave a `TODO(spec):` comment. Do not make the change.
- **Keep every i18n key.** Do not delete or rename keys, even ones that are no longer used. New strings go into all four `messages/{en,ja,es,ru}.json` (`tests/unit/messages.test.ts` fails otherwise). Use the exact strings in section 4.
- **No `<footer>` elements in Admin pages.** The e2e test asserts `getByRole("contentinfo")` has count 0. Use `<div>`.
- Do not touch: `src/components/admin/{admin-shell,sidebar,sidebar-nav,top-bar,mobile-nav,account-menu,language-menu,theme-toggle,breadcrumb,derived-breadcrumb,path-breadcrumb,crumb-labels,nav,stage-badge}.tsx|ts`, `src/components/admin/dashboard/*`, `src/app/[locale]/admin/{layout,default}.tsx`, `@breadcrumb/*`, `refunds/page.tsx` (a redirect), `src/components/portal/*` and `src/components/course/*`.
- **Never run** `pnpm build`, `pnpm dev`, `pnpm start`, `pnpm test:e2e`/Playwright, `pnpm check`, `pnpm db:reset` or anything that starts or stops a server or the Supabase stack. A production server is running from `.next`. The orchestrator runs e2e.
- Fast checks after each step, run **one at a time**, in this order: `pnpm format`, `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`.
  - If `pnpm typecheck` fails with errors that point into `.next/dev/types/…` (stale generated route types), move only that folder aside and re-run: `mv .next/dev/types "/tmp/claude-1000/next-dev-types-$(date +%s)"`. Never touch any other folder under `.next`.
- One commit per step. Use the subject line given for that step and put `Ticket: admin-redesign phase 2, step N` in the body. End every commit body with:
  ```
  Claude-Session: https://claude.ai/code/session_01DubEBM3rod3fp2Kets1yiy
  ```
- Import order and style follow the existing files. Use `cn` from `@/lib/utils`. Use icons from `lucide-react` only by the names this plan gives (all of them were checked to exist in the installed version). Decorative icons always get `aria-hidden`.
- Admin pages use **only** `src/components/admin/ui/*` primitives. The only marketing imports still allowed under `src/components/admin` and `src/app/[locale]/admin` after this phase are `@/components/ui/dropdown-menu` and `@/components/ui/sheet` (both used by the shell), `@/components/portal/dashboard` (view as Student) and `@/components/course/blocks/block-renderer` (lesson previews).

## 1. Selectors that must survive (from `tests/e2e/portal-and-admin.spec.ts` and `axe-sweep.spec.ts`)

| Where | Selector | What keeps it working |
| --- | --- | --- |
| every Admin page | `getByRole("banner").getByRole("button", { name: firstName })` | the top bar, untouched |
| `/admin` | `getByRole("heading", { level: 1, name: "Dashboard" })` | `AdminPageHeader title={t("nav.dashboard")}` renders an `<h1>` (step 1) |
| `/admin` | `getByRole("navigation", { name: "Admin sections" })`, its links "Dashboard" (`aria-current="page"`), "Support requests" (`href="/admin/tickets"`), "Students" (exact) | the sidebar, untouched |
| every Admin page | `getByRole("contentinfo")` has count 0 | no `<footer>` |
| `/admin` | `getByRole("main").getByRole("link", { name: /^Registered\b/ })` → `/admin/students?stage=registered` | the Dashboard stage cards, untouched |
| `/admin`, `/admin/students`, `/admin/orders` | no serious or critical axe issues | every form control has a label or `aria-label`; use the badge, button and link colors from this plan (they were picked for 4.5:1 contrast); links in running text keep an underline |

There are no other Admin selectors in the e2e suite and no unit tests on Admin components. Even so, keep every visible label, `aria-label`, `role` and `name` that exists today. The only visible text this plan changes is listed in section 3.10.

## 2. Design system (decided; do not deviate)

### 2.1 Page frame

Every Admin page returns this as its root:

```tsx
<div className="flex flex-col gap-6">
  <AdminPageHeader … />
  {/* cards */}
</div>
```

Do not use a root `<section>` and do not add your own `max-w-*`; the shell already constrains width.

### 2.2 Page header: `src/components/admin/page-header.tsx` (new)

```tsx
import { cn } from "@/lib/utils";

/** Title row of every Admin page: h1, optional description, meta row and actions. */
export function AdminPageHeader({
  title,
  description,
  meta,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Badges or short facts under the title (status, id, lock state). */
  meta?: React.ReactNode;
  /** Buttons on the right; wraps under the title on narrow screens. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-x-4 gap-y-3", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
        {meta ? (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">{meta}</div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
```

**Title rule:** the `<h1>` of a section's index page is the sidebar label `Admin.nav.<key>`, so the sidebar, breadcrumb and heading always match. Detail pages use the record's own title (a name, an id). The `generateMetadata` titles do not change.

Header actions are `AdminButton size="sm"`: primary `variant="default"`, others `variant="outline"`, with a leading icon.

### 2.3 Cards and sections

A page is a stack of `AdminCard`s, one per topic, following the Dashboard pattern:

```tsx
<AdminCard>
  <AdminCardHeader>
    <div>
      <AdminCardTitle>{title}</AdminCardTitle>              {/* h2 */}
      <AdminCardDescription>{description}</AdminCardDescription>  {/* optional */}
    </div>
    {/* optional right side: a count AdminBadge, or AdminButton size="xs" */}
  </AdminCardHeader>
  <AdminCardContent>…</AdminCardContent>   {/* p-4; leave it out when the body is a table, list or AdminDetailList */}
</AdminCard>
```

- Lists inside a card: `<ul className="divide-y">`. Each row is `flex items-center gap-3 px-4 py-2.5 text-sm`.
- Text sizes: card title `text-sm font-semibold` (from the primitive), body `text-sm`, secondary `text-xs text-muted-foreground`, ids and codes `font-mono text-xs`, numbers `tabular-nums`.
- Add `className="overflow-hidden"` to a card whose rows have a hover background (tables, disclosures). **Never** add it to cards that contain a `LangBadge`, whose tooltip would get clipped (Content and Lesson pages).

### 2.4 Detail-page layout

```tsx
<div className="flex flex-col gap-6">
  <AdminPageHeader title=… meta=… actions=… />
  <div className="grid items-start gap-6 lg:grid-cols-3">
    <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">{/* main cards */}</div>
    <div className="flex min-w-0 flex-col gap-6">{/* Summary card first, then side forms */}</div>
  </div>
</div>
```

The Summary card is an `AdminCard` with `AdminCardHeader` > `AdminCardTitle` = `tc("summary")` (new key), followed directly by `<AdminDetailList items=… />` (no `AdminCardContent`).

### 2.5 Tables

- Paged lists use `DataTable` (restyled in step 2). It renders its own `AdminCard` with an optional header (title, description, toolbar), the table, an empty state and a pagination footer.
- Small fixed tables (batches, AI usage, refunds on an order, a Student's attempts) use `AdminCard` > `AdminCardHeader` > `AdminTable` with its parts directly, the same way `dashboard/recent-students.tsx` does.
- Cell rules: dates as today (`slice(0, 10)` and so on; do not change the formatting). Money cells and numbers get `className="text-right tabular-nums"` on both `AdminTableHead` and `AdminTableCell`. Free-text cells (reasons, errors, audit reasons) get `className="whitespace-normal min-w-48"`. Ids get `font-mono text-xs`.
- Primary links in a cell: `className="font-medium hover:underline"`. Id links: `className="font-mono text-xs font-medium hover:underline"`.

### 2.6 Filters, tabs, search

- **Filter chips** (status or stage filters as links): `AdminFilterLinks` (new, step 1). Each chip is a `Link` with `aria-current="page"` when active. In a `DataTable`, they go in its `toolbar`.
- **Tabs that change the URL** (Orders / Refund requests, Site content tabs): `AdminTabNav` (new, step 1), an underline tab bar right under the page header.
- **Client tabs** (the language tabs in the course editor): keep the existing `role="tablist"`/`role="tab"` buttons and apply `adminTabListClass`/`adminTabClass`.
- **Search**: a plain GET `<form role="search">` with a leading `SearchIcon` inside `AdminInput`, then an `AdminButton variant="outline"` submit (exact markup in step 3).

### 2.7 Forms

- Every labelled control: `<AdminField label=… hint=…>` around `AdminInput` / `AdminSelect` / `AdminTextarea`. `AdminField` is a `<label>`, so `getByLabel` keeps working.
- Checkboxes and radios: native `<input type="checkbox|radio" className={adminCheckClass}>`, or `AdminCheckboxField`.
- Field grid: `grid gap-4 sm:grid-cols-2`. Textareas and JSON fields span both columns (`sm:col-span-2` on the `AdminField`).
- Submit button: `AdminButton type="submit" size="sm"` (primary) placed after the fields, `className="w-fit"` when it sits in a column layout.
- Save status messages: success `text-sm font-medium text-emerald-700 dark:text-emerald-400` with a leading `CheckIcon`; error `text-sm font-medium text-red-700 dark:text-red-400`. Keep `role="status"`/`role="alert"` as they are.

### 2.8 Destructive and sensitive actions

Behavior does not change. Only the look is standardized:

| Kind | Today | Look after this phase |
| --- | --- | --- |
| Audited write with a required reason | `ConfirmForm` | `ConfirmForm`: fields + reason + submit. `tone="destructive"` (solid red `destructive` button) for blocking actions (Lock), `tone="secondary"` (outline) for routine ones, `tone="primary"` (default) for saving edited details |
| Content delete that asks first | `ConfirmSubmit` (`window.confirm`) | `ConfirmSubmit`: `destructive-ghost` at `size="xs"`, `destructive-outline` at `size="sm"` |
| Delete or demote with no prompt today (CrudList delete, question delete, settings demote, refund deny) | plain red text button | `AdminButton variant="destructive-ghost"` (`size="sm"`, or `xs` in rows), plus `variant="destructive-outline" size="sm"` for refund Deny. **No new confirm.** Adding one would be a behavior change, so leave it out |

### 2.9 Status badge colors (`StatusBadge`, step 1)

| Status | Tone |
| --- | --- |
| enrollments: `active` | `info` |
| `paused` | `warning` |
| `locked`, `expired` | `danger` |
| `completed` | `success` |
| `refunded`, `partially_refunded` | `neutral` |
| orders: `pending` | `warning` |
| `paid` | `success` |
| `failed` | `danger` |
| refunds: `requested` | `warning` |
| `approved` | `info` |
| `rejected` | `danger` |
| `processed` | `success` |
| reports: `queued` | `neutral` |
| `sent` | `info` |
| `accepted` | `done` |
| `error` | `danger` |
| tickets: `open` | `warning` |
| `in_progress` | `info` |
| `closed` | `neutral` |
| anything else | `neutral` |

`StageBadge` (Student stages) keeps its own map.

## 3. Steps

Group A (one Sonnet agent, run first): steps 1–7. Group B (a second Sonnet agent, run after A is committed): steps 8–12. Group B depends on the primitives from step 1 and on `DataTable`/`ConfirmForm` from step 2. A single agent could do all twelve, but two keep each context small. Do not run the groups in parallel, because both edit `messages/*.json` and `admin.css`.

---

### Step 1: admin primitives, badges, messages and Dashboard header

Commit: `feat(admin): page header, form, tabs, empty-state and pagination primitives`

**1a. `src/components/admin/ui/button.tsx`**: add to `variant`:

```
"destructive-outline": "border border-input bg-background text-red-700 shadow-xs hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950",
"destructive-ghost": "text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950",
```

and to `size`: `"icon-xs": "size-7",`. Nothing else changes.

**1b. New `src/components/admin/ui/field.tsx`**:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

/** Native checkbox/radio look in the Admin. */
export const adminCheckClass = "size-4 shrink-0 accent-primary";

/** A label above its control, with an optional hint below. */
export function AdminField({ label, hint, className, children }: {
  label: React.ReactNode; hint?: React.ReactNode; className?: string; children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function AdminCheckboxField({ label, className, ...props }:
  Omit<React.ComponentProps<"input">, "type"> & { label: React.ReactNode }) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", className)}>
      <input type="checkbox" className={adminCheckClass} {...props} />
      {label}
    </label>
  );
}
```

**1c. New `src/components/admin/ui/select.tsx`**: a native select with a chevron. The wrapper is a `<span>` so it is valid inside a `<label>`.

```tsx
import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSelect({ className, wrapperClassName, ...props }:
  React.ComponentProps<"select"> & { wrapperClassName?: string }) {
  return (
    <span className={cn("relative block w-full", wrapperClassName)}>
      <select
        data-slot="admin-select"
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-background py-1 pr-8 pl-3 text-sm shadow-xs transition-[border-color,box-shadow] outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
    </span>
  );
}
```

Inside flex rows (toolbars, inline forms) pass `wrapperClassName="w-auto"` so it sizes to its content.

**1d. New `src/components/admin/ui/textarea.tsx`**: `AdminTextarea({ className, ...props }: React.ComponentProps<"textarea">)`, `data-slot="admin-textarea"`, classes:
`min-h-16 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30`

**1e. New `src/components/admin/ui/empty.tsx`**:

```tsx
import type { LucideIcon } from "lucide-react";
import { InboxIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminEmpty({ icon: Icon = InboxIcon, title, description, action, className }: {
  icon?: LucideIcon; title: string; description?: React.ReactNode; action?: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-4 py-10 text-center", className)}>
      <Icon aria-hidden className="size-8 text-muted-foreground/60" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
```

**1f. New `src/components/admin/ui/alert.tsx`**:

```tsx
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  danger: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
} as const;

export function AdminAlert({ tone = "info", icon: Icon, className, children, ...props }:
  React.ComponentProps<"div"> & { tone?: keyof typeof TONES; icon?: LucideIcon }) {
  return (
    <div data-slot="admin-alert" className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 text-sm", TONES[tone], className)} {...props}>
      {Icon ? <Icon aria-hidden className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
```

**1g. New `src/components/admin/ui/detail-list.tsx`**:

```tsx
import { cn } from "@/lib/utils";

/** Label/value rows for a Summary card. Put it straight under AdminCardHeader. */
export function AdminDetailList({ items, className }: {
  items: { label: string; value: React.ReactNode }[]; className?: string;
}) {
  return (
    <dl className={cn("divide-y text-sm", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
          <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-right font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

**1h. New `src/components/admin/ui/disclosure.tsx`**: an expandable row, built on `<details>` so it needs no client JS.

```tsx
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDisclosureList({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("divide-y", className)} {...props} />;
}

export function AdminDisclosure({ summary, children, className }: {
  summary: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <details className={cn("group", className)}>
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        <ChevronRightIcon aria-hidden className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
        <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{summary}</span>
      </summary>
      <div className="border-t bg-muted/30 px-4 py-4">{children}</div>
    </details>
  );
}
```

**1i. New `src/components/admin/ui/tabs.tsx`**:

```tsx
import { Link } from "@/i18n/navigation";

export const adminTabListClass = "flex flex-wrap gap-x-5 border-b";
export const adminTabClass =
  "-mb-px inline-flex h-9 items-center gap-1.5 border-b-2 border-transparent text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-foreground aria-selected:border-primary aria-selected:text-foreground";

type Href = React.ComponentProps<typeof Link>["href"];

/** Tabs that are links (the tab lives in the URL). */
export function AdminTabNav({ label, items }: {
  label: string;
  items: { key: string; href: Href; label: React.ReactNode; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className={adminTabListClass}>
      {items.map((item) => (
        <Link key={item.key} href={item.href} aria-current={item.active ? "page" : undefined} className={adminTabClass}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

**1j. New `src/components/admin/ui/pagination.tsx`**:

```tsx
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminButtonVariants } from "./button";

export function AdminPagination({ label, pageLabel, previousHref, nextHref, previousLabel, nextLabel }: {
  label: string; pageLabel: string; previousHref: string | null; nextHref: string | null;
  previousLabel: string; nextLabel: string;
}) {
  const cls = adminButtonVariants({ variant: "outline", size: "sm" });
  return (
    <nav aria-label={label} className="flex items-center justify-between gap-2 border-t px-4 py-2.5">
      <p className="text-xs text-muted-foreground tabular-nums">{pageLabel}</p>
      <div className="flex items-center gap-2">
        {previousHref ? (
          <Link href={previousHref} className={cls}><ChevronLeftIcon aria-hidden />{previousLabel}</Link>
        ) : (
          <span aria-disabled="true" className={cls}><ChevronLeftIcon aria-hidden />{previousLabel}</span>
        )}
        {nextHref ? (
          <Link href={nextHref} className={cls}>{nextLabel}<ChevronRightIcon aria-hidden /></Link>
        ) : (
          <span aria-disabled="true" className={cls}>{nextLabel}<ChevronRightIcon aria-hidden /></span>
        )}
      </div>
    </nav>
  );
}
```

**1k. New `src/components/admin/filter-links.tsx`**: the chip style the Students page uses today, moved into a component.

```tsx
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Href = React.ComponentProps<typeof Link>["href"];

export function AdminFilterLinks({ label, items, className }: {
  label: string;
  items: { key: string; href: Href; label: React.ReactNode; active: boolean }[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <Link key={item.key} href={item.href} aria-current={item.active ? "page" : undefined}
          className="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium hover:bg-accent aria-[current=page]:border-primary aria-[current=page]:bg-accent">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

**1l. New `src/components/admin/page-header.tsx`**: exactly as in 2.2.

**1m. `src/components/admin/status-badge.tsx`**: rewrite to use `AdminBadge`, with the tone map in 2.9 (`const TONE: Record<string, AdminBadgeTone> = { … }`) and a new optional `label?: string` prop. The text is `label ?? (t.has(status as never) ? t(status as never) : status.replaceAll("_", " "))`. Remove the `@/components/ui/badge` import.

**1n. `src/components/admin/lang-badge.tsx`**: replace `Badge` with `AdminBadge tone={ok ? "success" : "danger"} className="px-1 text-[10px] uppercase" aria-hidden="true"`. Tooltip span classes become `pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-md` + the same visibility classes + `ok ? "bg-foreground text-background" : "bg-destructive text-white"`. Keep `LANGUAGE_NAMES`, `tabIndex`, `aria-label` and `role="tooltip"`.

**1o. Messages**: add every key in section 4, in all four files, at the paths given.

**1p. `src/app/[locale]/admin/page.tsx`** (Dashboard): replace the title `<div>` (the h1 + subtitle) with `<AdminPageHeader title={t("nav.dashboard")} description={t("dashboard.subtitle")} />`. Nothing else changes.

Verify: format, lint, typecheck, test:unit.

---

### Step 2: DataTable, ConfirmForm

Commit: `refactor(admin): DataTable and ConfirmForm on admin primitives`

**`src/components/admin/data-table.tsx`**:
- `Column<Row>` gains `className?: string`, applied to both the `AdminTableHead` and the `AdminTableCell` of that column.
- New optional props: `title?: string`, `description?: string`, `toolbar?: React.ReactNode`, `emptyTitle?: string`.
- The `t` namespace stays `Admin.common`.
- Render:
  ```tsx
  <AdminCard className="overflow-hidden">
    {title || toolbar ? (
      <div className="flex flex-col gap-3 border-b px-4 py-3">
        {title ? (<div><AdminCardTitle>{title}</AdminCardTitle>{description ? <AdminCardDescription>{description}</AdminCardDescription> : null}</div>) : null}
        {toolbar}
      </div>
    ) : null}
    {shown.length === 0 ? (
      <AdminEmpty icon={SearchXIcon} title={emptyTitle ?? t("noResults")} />
    ) : (
      <AdminTable>
        <AdminTableHeader><AdminTableRow>{columns.map(c => <AdminTableHead key={c.header} className={c.className}>{c.header}</AdminTableHead>)}</AdminTableRow></AdminTableHeader>
        <AdminTableBody>{shown.map(row => <AdminTableRow key={rowKey(row)}>{columns.map(c => <AdminTableCell key={c.header} className={c.className}>{c.cell(row)}</AdminTableCell>)}</AdminTableRow>)}</AdminTableBody>
      </AdminTable>
    )}
    {shown.length > 0 && (page > 1 || hasNext) ? (
      <AdminPagination label={t("pagination")} pageLabel={t("page", { page })}
        previousHref={page > 1 ? href(page - 1) : null} nextHref={hasNext ? href(page + 1) : null}
        previousLabel={t("previous")} nextLabel={t("next")} />
    ) : null}
  </AdminCard>
  ```
- Remove the `buttonVariants` import and the old early-return `<p>`. The `href()` builder stays unchanged.

**`src/components/admin/confirm-form.tsx`**: same props, plus `tone?: "primary" | "secondary" | "destructive"` (default `"primary"`) and `layout?: "inline" | "stacked"` (default `"inline"`). Keep the doc comment.

```tsx
const stacked = layout === "stacked";
<form action={action} className={stacked ? "flex flex-col gap-3" : "flex flex-wrap items-end gap-3"}>
  {hidden inputs, unchanged}
  {children}
  <AdminField label={reasonLabel} className={stacked ? undefined : "w-full sm:w-64"}>
    <AdminInput name="reason" required minLength={5} maxLength={500} />
  </AdminField>
  <AdminButton type="submit" className={stacked ? "w-fit" : undefined}
    variant={tone === "destructive" ? "destructive" : tone === "secondary" ? "outline" : "default"}>
    {submitLabel}
  </AdminButton>
</form>
```

Callers of `ConfirmForm` pass their extra fields as `AdminField` + `AdminInput`/`AdminSelect`. Callers that still pass old bare inputs keep working until their own step.

Verify: format, lint, typecheck, test:unit.

---

### Step 3: Students list, Student detail, view as Student

Commit: `feat(admin): restyle Students list and Student detail`

**`src/app/[locale]/admin/students/page.tsx`**:
- Add `tNav = await getTranslations({ locale, namespace: "Admin.nav" })` and `tDesc = …"Admin.descriptions"` to the existing `Promise.all`.
- Root `<div className="flex flex-col gap-6">` → `<AdminPageHeader title={tNav("students")} description={tDesc("students")} />` → `<DataTable … toolbar={…} />`. The `<h1>`, the old `<form>` and the old `<nav>` are removed from the root.
- `toolbar`:
  ```tsx
  <>
    <form role="search" className="flex w-full max-w-md items-center gap-2">
      {stage ? <input type="hidden" name="stage" value={stage} /> : null}
      <div className="relative min-w-0 flex-1">
        <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <AdminInput type="search" name="q" defaultValue={q} aria-label={t("searchLabel")} placeholder={t("searchLabel")} className="pl-8" />
      </div>
      <AdminButton type="submit" variant="outline">{tc("search")}</AdminButton>
    </form>
    <AdminFilterLinks label={t("stageFilterLabel")} items={[undefined, ...STUDENT_STAGES].map((s) => ({
      key: s ?? "all",
      href: { pathname: "/admin/students", query: { ...(q ? { q } : {}), ...(s ? { stage: s } : {}) } },
      label: s ? tStages(s) : tc("all"),
      active: s === stage,
    }))} />
  </>
  ```
  The form has no `action`, as today, so it submits to the current localized URL.
- Columns: name `className="font-medium hover:underline"` (drop `underline`); email cell `<span className="text-muted-foreground">{r.email}</span>`; license `font-mono text-xs` via `className` on the column; joined `className="tabular-nums"`.

**`src/app/[locale]/admin/students/[userId]/page.tsx`**: detail layout from 2.4. Delete the local `Block` component and the `input` const.
- Header: `title={`${profile.first_name} ${profile.last_name}`}`, `description={s.email}`, `meta={profile.details_locked_at ? <AdminBadge tone="warning"><LockIcon aria-hidden />{t("detailsLocked")}</AdminBadge> : <AdminBadge><LockOpenIcon aria-hidden />{t("detailsOpen")}</AdminBadge>}`, `actions={<AdminButton asChild variant="outline" size="sm"><Link href={`/admin/students/${userId}/view`}><EyeIcon aria-hidden />{t("viewAs")}</Link></AdminButton>}`.
- **Main column**, in this order:
  1. Card `t("enrollments")`. The body is `<div className="divide-y">`; with none, `<AdminEmpty title={t("noneYet")} />`. Each enrollment is `<div className="flex flex-col gap-4 p-4">` holding:
     - a line `<div className="flex flex-wrap items-center gap-3 text-sm">`: the `Link` to `/admin/enrollments/${e.id}` (`font-mono text-xs font-medium hover:underline`, text `e.id.slice(0, 8)`), `<StatusBadge status={e.status} />`, `<span className="text-muted-foreground">{t("progress")}: <span className="font-medium text-foreground tabular-nums">{s.progress[e.id] ?? 0}%</span></span>`, `<span className="text-muted-foreground">{te("expires")}: {e.expires_at?.slice(0, 10) ?? "—"}</span>`;
     - `<EnrollmentActions locale={locale} enrollment={e} />`.
  2. Card `t("quizAttempts")`: `AdminTable` with columns `tc("date")` (`q.submitted_at?.slice(0, 16).replace("T", " ") ?? "—"`, `tabular-nums`), `t("score")` (right-aligned, `q.score ?? "—"`) and `t("result")` (`<ResultBadge>`, below). With no rows: `<AdminEmpty title={t("noneYet")} />`.
  3. Card `t("examAttempts")`: the same columns, using `x.started_at.slice(0, 16).replace("T", " ")`.
  4. Card `t("identityChecks")`: columns `tc("date")` (`c.asked_at…`), `t("question")` (`font-mono text-xs`, `c.question_key`) and `t("result")` (`c.correct ? <AdminBadge tone="success">{t("correct")}</AdminBadge> : <AdminBadge tone="danger">{t("incorrect")}</AdminBadge>`).
  5. Card `t("orders")`: exactly these columns: order (header `t("orders")`; id link `font-mono text-xs font-medium hover:underline`, text `o.id.slice(0, 8).toUpperCase()`), amount (header `tOrders("amount")`, right-aligned), status (`tc("status")`, `<StatusBadge>`) and `t("refunds")` (each refund on that order as `<span className="mr-3 inline-flex items-center gap-1.5">{formatUsd(r.amount_cents, locale)} <StatusBadge status={r.status} /></span>`, or `—`). Add `tOrders = getTranslations({ locale, namespace: "Admin.orders" })`.
  6. Card `t("audit")`: columns `tc("date")` (`a.created_at.slice(0, 16).replace("T", " ")`), `t("action")` (`font-mono text-xs`, `a.action`) and `tc("reason")` (`whitespace-normal min-w-48`; the reason as today, or `—`).
  - `ResultBadge` is a local function in the file: `function ResultBadge({ passed, submitted, labels }: { passed: boolean | null; submitted: boolean; labels: { passed: string; failed: string } })` returns `passed ? <AdminBadge tone="success">{labels.passed}</AdminBadge> : submitted ? <AdminBadge tone="danger">{labels.failed}</AdminBadge> : "—"`. Call it as `<ResultBadge passed={q.passed} submitted={Boolean(q.submitted_at)} labels={{ passed: t("passed"), failed: t("failed") }} />` (same for exams with `x`), which keeps today's logic.
- **Side column**:
  1. Summary card: title `tc("summary")`, then `AdminDetailList` with items `t("email")` → `s.email`, `t("legalName")` → `profile.legal_name ?? "—"`, `t("dob")` → `profile.dob ?? "—"`, `t("licenseNo")` → `profile.license_no ?? "—"` (value in `font-mono text-xs`) and `t("phone")` → `profile.phone ?? "—"`.
  2. Card `t("editLocked")` > `AdminCardContent` > `ConfirmForm layout="stacked" tone="primary"` (same action, hidden, labels), with children `AdminField label={t("legalName")}` > `AdminInput name="legalName" required defaultValue=…`, then `dob` (`type="date"`), then `licenseNo`. Same attributes as today.
  3. Card `t("editContact")` > `AdminCardContent` > `ConfirmForm layout="stacked"` with `AdminField label={t("phone")}` > `AdminInput name="phone" defaultValue=…`.

**`src/app/[locale]/admin/students/[userId]/view/page.tsx`**: the root becomes `<div className="flex flex-col gap-6">`. Replace the amber `<p>` with `<AdminAlert tone="warning" icon={EyeIcon} role="status">{t("readOnly")}</AdminAlert>`. `<Dashboard …>` stays untouched.

Verify: format, lint, typecheck, test:unit.

---

### Step 4: Enrollments list and detail, EnrollmentActions

Commit: `feat(admin): restyle Enrollments list, Enrollment detail and enrollment actions`

**`src/components/admin/enrollment-actions.tsx`**: root `<div className="flex flex-col divide-y [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">`. Each child is one `<div>`:
1. `ConfirmForm extendAccess tone="secondary"` with `AdminField label={t("days")}` > `AdminInput type="number" name="days" defaultValue={30} min={1} max={365} required className="w-24"`.
2. `<div className="flex flex-col gap-2">` with `<p className="text-xs text-muted-foreground">{t("resets", …)}</p>` followed by `ConfirmForm grantExamReset tone="secondary"`.
3. If `canLock`: `ConfirmForm … to:"lock" tone="destructive"`.
4. If `canUnlock`: `ConfirmForm … to:"unlock" tone="secondary"`.
5. If `started_at`: `<p className="text-sm text-muted-foreground">{t("languageLocked")}</p>`. Otherwise `ConfirmForm changeCourseLanguage tone="secondary"` with `<AdminSelect name="courseLocale" defaultValue=… aria-label={t("language")} wrapperClassName="w-auto">` holding the same options.

The component no longer draws its own border. Callers put it inside a card.

**`src/app/[locale]/admin/enrollments/page.tsx`**:
- Add `tNav`, `tDesc` and `tStatus = getTranslations({ locale, namespace: "Admin.statuses" })` (all `STATUSES` exist there after step 1).
- `<AdminPageHeader title={tNav("enrollments")} description={tDesc("enrollments")} />`.
- `DataTable toolbar={<AdminFilterLinks label={t("filter")} items={[{ key: "all", href: "/admin/enrollments", label: t("all"), active: !status }, ...STATUSES.map((s) => ({ key: s, href: { pathname: "/admin/enrollments", query: { status: s } }, label: tStatus(s), active: status === s }))]} />}`. The hrefs stay identical to today.
- Columns: detail id link `font-mono text-xs font-medium hover:underline`; user link `font-medium hover:underline`; language `className="uppercase text-xs font-medium"`; started and expires `className="tabular-nums"`.

**`src/app/[locale]/admin/enrollments/[id]/page.tsx`**: detail layout.
- Add `tc` (`Admin.common`).
- Header: `title={t("detail")}`, `meta={<><span className="font-mono text-xs">{e.id.slice(0, 8)}</span><StatusBadge status={e.status} /></>}`.
- Main: card `t("actions")` > `AdminCardContent` > `<EnrollmentActions …/>`.
- Side: Summary card with items `t("user")` → the link (`font-medium hover:underline`, same text as today), `t("status")` → `StatusBadge`, `t("language")` → `e.course_locale` (uppercase), `t("started")` and `t("expires")` → same values as today.

Verify: format, lint, typecheck, test:unit.

---

### Step 5: Orders list and detail, RefundQueue

Commit: `feat(admin): restyle Orders, Order detail and the refund queue`

**`src/components/admin/refund-queue.tsx`**: it renders **only the body**, no card. Callers wrap it.
- Empty: `<AdminEmpty icon={CircleCheckIcon} title={t("admin.empty")} />`.
- Otherwise an `AdminTable`:
  - heads: `t("admin.order")`, `t("admin.reason")`, `t("admin.amount")` (right-aligned), and an empty last head `<AdminTableHead className="text-right"><span className="sr-only">{t("admin.approve")} / {t("admin.deny")}</span></AdminTableHead>`;
  - order cell `font-mono text-xs`; reason cell `whitespace-normal min-w-48`;
  - amount cell right-aligned `tabular-nums`, with the preview line kept as `<span className="block text-xs text-muted-foreground">`;
  - the last cell `text-right` holds the same form, as `<form action={decideRefund} className="inline-flex gap-2">`, with `AdminButton type="submit" name="decision" value="approve" size="sm"` and `AdminButton type="submit" name="decision" value="deny" size="sm" variant="destructive-outline"`.

**`src/app/[locale]/admin/orders/page.tsx`**:
- Add `tNav` and `tDesc`.
- `<AdminPageHeader title={tNav("orders")} description={tDesc("orders")} />`.
- Then `<AdminTabNav label={t("title")} items={[{ key: "orders", href: "/admin/orders", label: t("tabOrders"), active: tab === "orders" }, { key: "refunds", href: { pathname: "/admin/orders", query: { tab: "refunds" } }, label: t("tabRefunds"), active: tab === "refunds" }]} />`.
- Refunds tab: `<AdminCard className="overflow-hidden"><RefundQueue locale={locale} /></AdminCard>`.
- Orders tab: `DataTable` with columns: id link `font-mono text-xs font-medium hover:underline`; user `emails[r.user_id]`; product `className="font-mono text-xs"`; amount `className="text-right tabular-nums"`; status; date `tabular-nums`.

**`src/app/[locale]/admin/orders/[id]/page.tsx`**: detail layout. Add `tc` (`Admin.common`).
- Header: `title={<span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>}`, `meta={<StatusBadge status={order.status} />}`.
- Main:
  1. Card `t("calculator")` > `AdminCardContent`. With a preview: `<p className="text-sm font-medium">{t("refundable", …)}</p><p className="mt-1 text-sm text-muted-foreground">{tr(`reasons.${preview.reason}`)}</p>`. Without one, render nothing inside, as today.
  2. Card `t("refunds")` (`overflow-hidden`): `AdminTable` with heads `t("amount")` (right), `%` (right; use the literal header text `"%"`), `t("status")` and `tc("reason")` (`whitespace-normal min-w-48`), over the same rows. With none: `<AdminEmpty title={tc("nothingYet")} />`.
  3. Card `t("tabRefunds")` (`overflow-hidden`) > `<RefundQueue locale={locale} orderId={id} />`.
- Side: Summary with items `t("user")` → the link (`font-medium hover:underline`), `t("product")` → `order.product` (`font-mono text-xs`), `t("amount")` → `formatUsd`, `t("status")` → badge and `tc("date")` → `order.created_at.slice(0, 10)`.

Verify: format, lint, typecheck, test:unit.

---

### Step 6: Reporting

Commit: `feat(admin): restyle DMV reporting`

**`src/app/[locale]/admin/reporting/page.tsx`**: add `tNav`, `tDesc` and `tStatus` (`Admin.statuses`).
- Header: `title={tNav("reporting")}`, `description={tDesc("reporting")}`, `actions`:
  ```tsx
  <>
    <a href="/api/admin/reports.csv" className={adminButtonVariants({ variant: "outline", size: "sm" })}><DownloadIcon aria-hidden />{t("exportCsv")}</a>
    <form action={runBatchNow}><AdminButton type="submit" size="sm"><PlayIcon aria-hidden />{t("runNow")}</AdminButton></form>
  </>
  ```
- Card 1 `t("queueHeading")` (header right side `<AdminBadge tone={n ? "danger" : "neutral"}>{n}</AdminBadge>`, where `n` = queue length). Empty: `<AdminEmpty icon={CircleCheckIcon} title={t("queueEmpty")} />`. Otherwise `<ul className="divide-y">`, each `<li className="flex flex-col gap-3 p-4">` holding:
  - `<div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-mono text-xs font-medium">{cert?.cert_no}</span><StatusBadge status={r.status} /><span className="text-xs text-muted-foreground">{t("attempts", { count: r.attempts })}</span></div>`;
  - if `r.error`: `<p className="text-sm text-red-700 dark:text-red-400">{r.error}</p>`;
  - the citation `ConfirmForm` (`tone="primary"`) with `AdminField label={t("citation")}` > `AdminInput name="citationNo" defaultValue=… required className="sm:w-56"`;
  - the resend `ConfirmForm tone="secondary"`.
- Card 2: `DataTable title={t("reportsHeading")} toolbar={<AdminFilterLinks label={t("reportsHeading")} items={[{ key: "all", href: "/admin/reporting", label: t("all"), active: !status }, ...STATUSES.map((s) => ({ key: s, href: { pathname: "/admin/reporting", query: { status: s } }, label: tStatus(s), active: status === s }))]} />}`. Columns: cert `font-mono text-xs`; ref `font-mono text-xs`; sent and accepted `tabular-nums`.
- Card 3 `t("batchesHeading")` (`overflow-hidden`): an `AdminTable` with the same three columns; counts cell `font-mono text-xs whitespace-normal`. With none: `<AdminEmpty title={tc("nothingYet")} />`.

Verify: format, lint, typecheck, test:unit.

---

### Step 7: Support requests (tickets)

Commit: `feat(admin): restyle Support requests`

**`src/app/[locale]/admin/tickets/page.tsx`**: add `tNav` and `tDesc`. Keep the `type Type = (typeof TYPES)[number]` and `Status` casts as today.
- `<AdminPageHeader title={tNav("tickets")} description={tDesc("tickets")} />`.
- `<AdminCard className="overflow-hidden">`, holding:
  - `<div className="flex flex-col gap-2 border-b px-4 py-3">` with two filters:
    - `<AdminFilterLinks label={t("filterType")} items={[{ key: "all", href: "/admin/tickets", label: tc("all"), active: !type && !status }, ...TYPES.map((ty) => ({ key: ty, href: `/admin/tickets?type=${ty}`, label: t(`types.${ty}`), active: type === ty }))]} />`;
    - `<AdminFilterLinks label={t("filterStatus")} items={STATUSES.map((s) => ({ key: s, href: `/admin/tickets?status=${s}`, label: t(`statuses.${s}`), active: status === s }))} />`.
    - The hrefs are exactly today's.
  - With no tickets: `<AdminEmpty icon={LifeBuoyIcon} title={t("none")} />`.
  - Otherwise `<AdminDisclosureList>`, one `<AdminDisclosure key={tk.id} summary={…}>` per ticket:
    - summary: `<AdminBadge>{t(`types.${tk.type as Type}`)}</AdminBadge><span className="min-w-0 truncate font-medium">{tk.email}</span><StatusBadge status={tk.status} label={t(`statuses.${tk.status as Status}`)} /><span className="ml-auto text-xs text-muted-foreground tabular-nums">{tk.created_at.slice(0, 10)}</span>`;
    - body: `<p className="text-sm whitespace-pre-wrap">{tk.body}</p>`, then `<form action={setTicketStatus} className="mt-4 flex flex-wrap items-center gap-2">` with the hidden id, `<AdminSelect name="status" aria-label={t("statusLabel")} defaultValue={tk.status} wrapperClassName="w-auto">` (same options) and `<AdminButton type="submit" size="sm">{tc("update")}</AdminButton>`.

Verify: format, lint, typecheck, test:unit.

**End of group A.**

---

### Step 8: CrudList, Courts, Settings, Site content

Commit: `feat(admin): restyle CrudList, Courts, Settings and Site content`

**`src/components/admin/crud-list.tsx`**:
- Delete the `input` const. `FieldInput`:
  - choices / `locale` / `select` → `<AdminField label={label}><AdminSelect name=… defaultValue=… [required]>…same options…</AdminSelect></AdminField>`;
  - `textarea` / `json` → `<AdminField label={label} className="sm:col-span-2"><AdminTextarea name=… defaultValue=… rows=… className="font-mono text-xs" /></AdminField>`;
  - `bool` → `<AdminCheckboxField name={field.name} defaultChecked={Boolean(value)} label={label} className="self-end sm:h-9" />`;
  - default → `<AdminField label={label}><AdminInput name=… defaultValue=… type=… /></AdminField>`.
- `RowForm`: `<form action={saveRow} className="flex flex-col gap-4">` → hidden inputs → `<div className="grid gap-4 sm:grid-cols-2">` with the fields → `<AdminButton type="submit" size="sm" className="w-fit">{submit}</AdminButton>`.
- `CrudList` gains **required** `title: string` and optional `description?: React.ReactNode`. It renders:
  ```tsx
  <AdminCard className="overflow-hidden">
    <AdminCardHeader>
      <div><AdminCardTitle>{title}</AdminCardTitle>{description ? <AdminCardDescription>{description}</AdminCardDescription> : null}</div>
      <AdminBadge>{rows.length}</AdminBadge>
    </AdminCardHeader>
    {rows.length === 0 ? <AdminEmpty title={t("common.nothingYet")} /> : (
      <AdminDisclosureList>
        {rows.map((row) => (
          <AdminDisclosure key={str(row.id)} summary={<>
            <span className="min-w-0 truncate font-medium">{/* same describe / locale·title text as today */}</span>
            {"published" in row && !row.published ? <AdminBadge tone="warning">{t("common.draft")}</AdminBadge> : null}
          </>}>
            <RowForm … submit={t("common.save")} />
            {allowDelete ? (
              <form action={deleteRow} className="mt-4 flex justify-end border-t pt-4">
                {/* same two hidden inputs */}
                <AdminButton type="submit" variant="destructive-ghost" size="sm"><Trash2Icon aria-hidden />{t("common.delete")}</AdminButton>
              </form>
            ) : null}
          </AdminDisclosure>
        ))}
      </AdminDisclosureList>
    )}
    {allowCreate ? (
      <div className="border-t">
        <AdminDisclosure summary={<span className="inline-flex items-center gap-1.5 font-medium text-link"><PlusIcon aria-hidden className="size-4" />{t("common.newItem", { label: t(`tables.${table}`) })}</span>}>
          <RowForm table={table} row={null} selectOptions={selectOptions} submit={t("common.create")} />
        </AdminDisclosure>
      </div>
    ) : null}
  </AdminCard>
  ```
  The draft marker becomes a badge without parentheses (see 3.10).

**`src/app/[locale]/admin/courts/page.tsx`**:
- Add `tNav`.
- `<AdminPageHeader title={tNav("courts")} description={t("hint", { example: '{"en": "..."}' })} />`.
- `<CrudList title={t("counties")} table="counties" … />`, then `<CrudList title={t("courthouses")} table="courts" … />`. Remove the h1, h2s and the hint `<p>`.

**`src/app/[locale]/admin/settings/page.tsx`**: add `tNav` and `tDesc`. Header: `title={tNav("settings")}`, `description={tDesc("settings")}`. Then:
1. Card `t("admins")` (`overflow-hidden`), header right side `<AdminBadge>{admins count}</AdminBadge>`:
   - `<ul className="divide-y">`, each `<li className="flex items-center gap-3 px-4 py-2.5 text-sm">` holding:
     - `<div className="min-w-0 flex-1"><p className="truncate font-medium">{a.first_name} {a.last_name}</p><p className="truncate text-xs text-muted-foreground">{emails.get(a.user_id)}</p></div>`;
     - then either `<span className="text-xs text-muted-foreground">{tc("you")}</span>` or the same demote `<form>` with `<AdminButton type="submit" variant="destructive-ghost" size="xs">{t("demote")}</AdminButton>`.
   - Below the list, `<div className="border-t px-4 py-3">` with `<form action={promoteAdmin} className="flex flex-wrap items-center gap-2">`, `<AdminInput name="email" type="email" aria-label=… required placeholder=… className="w-full sm:w-72" />` and `<AdminButton type="submit" size="sm"><PlusIcon aria-hidden />{t("makeAdmin")}</AdminButton>`.
2. `<CrudList title={t("stateConfig")} description={t("stateHint")} table="states" … />`. Remove the h2 and the `<p>`.
3. `<div className="grid gap-6 xl:grid-cols-2">` holding two cards:
   - Card `t("notify")` (`overflow-hidden`), header right side `<a href="/api/admin/waitlists.csv" className={adminButtonVariants({ variant: "outline", size: "xs" })}><DownloadIcon aria-hidden />{t("downloadCsv")}</a>`. Body `<ul className="divide-y text-sm">`: one row per state `<li className="flex justify-between px-4 py-2.5"><span className="font-mono text-xs">{code}</span><span className="tabular-nums">{n}</span></li>`, then a row `<li className="px-4 py-2.5">{t("classroomWaitlist", …)}</li>`.
   - Card `t("emailTemplates")` (keep the `TODO(spec)` comment): `<ul className="divide-y text-sm">`, rows `<li className="flex items-center gap-2 px-4 py-2.5"><MailIcon aria-hidden className="size-4 text-muted-foreground" />{t("templateNote", …)}</li>`.

**`src/app/[locale]/admin/site-content/page.tsx`**: add `tNav` and `tDesc`.
- Header: `title={tNav("siteContent")}`, `description={tDesc("siteContent")}`.
- Then `<AdminTabNav label={tNav("siteContent")} items={TABS.map((tab_) => ({ key: tab_.key, href: `/admin/site-content?tab=${tab_.key}`, label: t(`tabs.${tab_.key}`), active: tab_.key === tab.key }))} />`.
- Reviews note: `<AdminAlert tone="info" icon={InfoIcon}>{t("samples")}</AdminAlert>`. Keep the TODO comment.
- Gaps: `<AdminAlert tone="warning" icon={TriangleAlertIcon}>{t("missing", …)}</AdminAlert>`.
- `<CrudList title={t(`tabs.${tab.key}`)} …same props… />`.
- `Coupons` returns an `AdminCard` (`overflow-hidden`) with header title `t("tabs.coupons")`:
  - mock mode (keep the TODO): `<AdminEmpty icon={InfoIcon} title={t("couponsNeedStripe")} />`;
  - otherwise `<ul className="divide-y text-sm">`, rows `<li className="flex items-center justify-between px-4 py-2.5"><span className="font-mono text-xs font-medium">{c.code}</span>{c.active ? null : <AdminBadge>{t("inactive")}</AdminBadge>}</li>`;
  - with no codes: `<AdminEmpty title={t("noCodes")} />` instead of the list.

Verify: format, lint, typecheck, test:unit.

---

### Step 9: AI assistant

Commit: `feat(admin): restyle the AI assistant page`

**`src/app/[locale]/admin/ai/page.tsx`**: add `tNav`, `tDesc` and `tc` (`Admin.common`).
- Header: `title={tNav("ai")}`, `description={tDesc("ai")}`, `actions={<form action={reindexKnowledgeBaseAction}><AdminButton type="submit" variant="outline" size="sm"><RefreshCwIcon aria-hidden />{t("reindex")}</AdminButton></form>}`.
- Card `t("dailyCost")` (`overflow-hidden`): `AdminTable` with heads `t("day")`, `t("answers")` (right), `t("tokens")` (right) and `t("cost")` (right), and the same cell values. All number cells `text-right tabular-nums`. With none: `<AdminEmpty title={tc("nothingYet")} />`.
- `<div className="grid items-start gap-6 xl:grid-cols-3">`, holding:
  - Card `t("conversations")` (`overflow-hidden`):
    - `<ul className="divide-y">`, each `<li>`, with the same `<a href={`?c=${c.id}`}>` (keep the plain `<a>`): `className={cn("flex flex-col gap-1 px-4 py-2.5 text-sm hover:bg-muted/50", open === c.id && "bg-accent")}` and `aria-current={open === c.id ? "true" : undefined}`.
    - Inside the link: `<span className="tabular-nums">{c.created_at.slice(0, 16).replace("T", " ")}</span>`, then `<span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"><span className="uppercase">{c.locale}</span>{c.page ? <span className="truncate">{c.page}</span> : null}{c.flagged ? <AdminBadge tone="warning">{t("flagged")}</AdminBadge> : null}{c.handed_off_at ? <AdminBadge tone="info">{t("handedOff")}</AdminBadge> : null}</span>`.
    - With none: `<AdminEmpty icon={MessageSquareIcon} title={tc("nothingYet")} />`.
  - Card `t("transcript")`, `className="xl:col-span-2"`:
    - if `open`: `<AdminCardContent className="flex flex-col gap-3">`, each message `<div className="rounded-md border p-3 text-sm">` holding:
      - `<div className="flex items-center gap-2"><AdminBadge tone={m.role === "user" ? "neutral" : "info"}>{m.role}</AdminBadge>{m.flagged ? <AdminBadge tone="warning">{t("flagged")}</AdminBadge> : null}<form action={toggleMessageFlag} className="ml-auto">…same hidden inputs…<AdminButton type="submit" variant="ghost" size="xs"><FlagIcon aria-hidden />{m.flagged ? t("unflag") : t("flag")}</AdminButton></form></div>`;
      - then `<p className="mt-2 whitespace-pre-wrap">{m.content}</p>`.
    - if not `open`: `<AdminEmpty icon={MessageSquareIcon} title={t("pickConversation")} />`.

Verify: format, lint, typecheck, test:unit.

---

### Step 10: course editor, AI translate, Course content and Lesson pages

Commit: `feat(admin): restyle Course content, the lesson editor and AI translate`

**`src/components/admin/course-editor.tsx`**:
- Imports: drop `@/components/ui/{button,input,select,textarea}`. Use `AdminButton`, `AdminInput`, `AdminSelect`, `AdminTextarea`, `AdminField`, `adminCheckClass`, `adminTabListClass` and `adminTabClass`. Replace every `<Input` → `<AdminInput`, `<Select` → `<AdminSelect`, `<Textarea` → `<AdminTextarea` (all props unchanged).
- Delete the local `Field` and use `AdminField` (same `label`/`hint`/`children` API) everywhere `Field` was used.
- `SaveButton`: `AdminButton type="submit" size="sm"`.
- `Status`: saved → `<span role="status" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 dark:text-emerald-400"><CheckIcon aria-hidden className="size-4" />{t("saved")}</span>` (the "✓ " glyph is dropped). Error → `className="text-sm font-medium text-red-700 dark:text-red-400"`.
- `LocaleTabs`:
  - tablist `className={adminTabListClass}`;
  - each tab button `className={adminTabClass}` (drop the `cn` with the active branches; `aria-selected` drives the look);
  - the dot `className={cn("size-1.5 rounded-full", filled[l] ? "bg-emerald-500" : "bg-red-500")}`;
  - panels `className="flex flex-col gap-4 pt-4"` (unchanged), the optional hint `text-xs text-muted-foreground`.
- Scenario `fieldset`: `className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_1fr_auto]"`, legend `className="px-1 text-xs font-medium text-muted-foreground"`, the best-answer label `className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium"`, radio `className={adminCheckClass}`.
- Block type picker: legend `className="mb-2 text-sm font-medium"`. Each button `className={cn("flex flex-col items-start gap-0.5 rounded-md border p-3 text-left transition-colors", type === bt ? "border-primary bg-accent" : "hover:bg-muted/50")}`, title span `text-sm font-medium`.
- `BlockEditor` cancel: `AdminButton type="button" variant="ghost" size="sm"`.
- `AddBlock`: closed → `<AdminButton type="button" variant="outline" size="sm" onClick=…><PlusIcon aria-hidden />{t("addBlock")}</AdminButton>` (drop "+ "). Open wrapper → `className="rounded-lg border border-dashed border-primary/60 bg-card p-4"`.
- `EditToggle`: `AdminButton type="button" variant={open ? "secondary" : "outline"} size="xs" aria-expanded={open} …`.
- `ConfirmSubmit`: `AdminButton type="submit" size={size} variant={size === "sm" ? "destructive-outline" : "destructive-ghost"}` with the same `onClick`. Drop the `className`.

**`src/components/admin/ai-translate.tsx`**:
- Wrapper `className="flex flex-wrap items-center gap-2 rounded-md border border-dashed bg-muted/40 px-3 py-2"`.
- Label `<span className="inline-flex items-center gap-1.5 text-sm font-medium"><SparklesIcon aria-hidden className="size-4 text-primary" />{t("label")}</span>` (the "✨" is dropped).
- Select → `<AdminSelect aria-label={t("from")} value={source} onChange=… wrapperClassName="w-auto" className="h-8">` (same options).
- Button → `AdminButton type="button" size="xs"` (same `disabled`/`onClick`).
- Message classes: error `text-sm font-medium text-red-700 dark:text-red-400`, ok `text-sm font-medium text-emerald-700 dark:text-emerald-400`.

**`src/app/[locale]/admin/content/page.tsx`**: drop the `@/components/ui/*` imports. Add `tNav`.
- Header: `<AdminPageHeader title={tNav("content")} description={t("intro")} actions={<AdminButton asChild variant="outline" size="sm"><Link href="/admin/content/questions"><ListChecksIcon aria-hidden />{t("questionBank")}</Link></AdminButton>} />`.
- The course slug heading (only when more than one course) → `<h2 className="text-base font-semibold">`.
- Each section → `<AdminCard key=…>` (**no** `overflow-hidden`), holding:
  - Header row `<div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">`: `<AdminBadge tone="info">{t("section", …)}</AdminBadge>`, `<h2 className="min-w-0 flex-1 text-sm font-semibold">`, `<span className="text-xs text-muted-foreground">{lessonsCount}</span>` and the `EditToggle` (unchanged).
  - Lessons `<ol className="divide-y">`. Each `<li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">` holding:
    - number `<span className="w-10 text-xs font-medium text-muted-foreground tabular-nums">`;
    - link `className="min-w-0 flex-1 text-sm font-medium hover:underline"`;
    - meta `text-xs text-muted-foreground`;
    - the LangBadges (unchanged);
    - Edit `<AdminButton asChild variant="outline" size="xs"><Link …>{t("edit")}</Link></AdminButton>`.
  - With no lessons: `<p className="px-4 py-4 text-sm text-muted-foreground">{t("noLessons")}</p>`.
  - Bottom row `<div className="flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-t bg-muted/30 px-4 py-3">`: add lesson `<AdminButton type="submit" size="sm" variant="outline"><PlusIcon aria-hidden />{t("addLesson")}</AdminButton>`, delete section `ConfirmSubmit` (unchanged, xs).
- Add section: `<AdminButton type="submit" variant="outline" size="sm" className="w-fit"><PlusIcon aria-hidden />{t("addSection")}</AdminButton>`.

**`src/app/[locale]/admin/content/lessons/[id]/page.tsx`**: drop the `@/components/ui/*` imports.
- Back link: `<AdminButton asChild variant="ghost" size="sm" className="-ml-2 w-fit"><Link href="/admin/content"><ArrowLeftIcon aria-hidden />{t("back")}</Link></AdminButton>`. Remove the `<nav>` wrapper and the "← " glyph. Keep it as the first child of the root.
- Header: `<AdminPageHeader title={titles.en ?? "—"} meta={section ? <AdminBadge tone="info">{t("section", …)} · {lesson.position}</AdminBadge> : null} actions={<form action={deleteLesson}>…same hidden…<ConfirmSubmit size="sm" … /></form>} />`.
- Lesson details: `<AdminCard><AdminCardHeader><AdminCardTitle>{t("lessonDetails")}</AdminCardTitle></AdminCardHeader><AdminCardContent><LessonDetailsForm …/></AdminCardContent></AdminCard>`.
- Blocks heading: `<div><h2 className="text-base font-semibold">{t("blocksTitle")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("blocksIntro")}</p></div>`.
- No blocks: `<AdminCard><AdminEmpty title={t("noBlocks")} /></AdminCard>`.
- Invalid preview text: `<p className="text-sm font-medium text-red-700 dark:text-red-400">`.
- Each block → `<AdminCard key=…>` (no `overflow-hidden`). Header row `<div className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5">`, holding:
  - index `text-xs font-medium text-muted-foreground tabular-nums`;
  - `<AdminBadge tone="info">{t(`types.${type}`)}</AdminBadge>`;
  - the LangBadges;
  - the move form unchanged, with each button as `<AdminButton type="submit" name="dir" value="up|down" variant="ghost" size="icon-xs" disabled=… aria-label=… title=…><ArrowUpIcon aria-hidden /></AdminButton>` (and `ArrowDownIcon`, replacing the ↑/↓ glyphs);
  - the `EditToggle`, whose panel is `className="mt-2 rounded-lg border bg-muted/30 p-4"`;
  - the delete form with `ConfirmSubmit` (xs).
- Preview `<div className="px-4 py-4">`. `AddBlock` unchanged.

Verify: format, lint, typecheck, test:unit.

---

### Step 11: Question bank

Commit: `feat(admin): restyle the Question bank`

**`src/app/[locale]/admin/content/questions/page.tsx`**: delete the `field` const. Add `tNav` and `tDesc`.
- `QuestionForm`: `<form action={saveQuestion} className="flex flex-col gap-4">`, holding:
  - the hidden id;
  - `<div className="grid gap-4 sm:grid-cols-2">` with `AdminField label={t("pool")}` > `AdminSelect name="sectionId" …` and `AdminField label={tc("language")}` > `AdminSelect name="locale" …` (same options);
  - `AdminField label={t("question")}` > `AdminTextarea name="text" required rows={2} …`;
  - for each option, `<div className="flex items-center gap-2">` with `<input type="radio" … className={adminCheckClass} />` (same attributes) and `<AdminInput name={`option${i}`} aria-label=… required defaultValue=… placeholder=… />`;
  - `AdminField label={t("explanation")}` > `AdminTextarea name="explanation" rows={2} …`;
  - `<AdminButton type="submit" size="sm" className="w-fit">{q ? t("save") : t("add")}</AdminButton>`.
- Page:
  - Keep the comment about correct answers.
  - `<AdminPageHeader title={tNav("questions")} description={tDesc("questions")} />`.
  - `<AdminCard className="overflow-hidden">`, holding:
    - the filter form `<form className="flex flex-wrap items-center gap-2 border-b px-4 py-3">` with `<AdminSelect name="locale" aria-label={tc("language")} defaultValue={qLocale} wrapperClassName="w-auto">`, `<AdminSelect name="section" aria-label={t("pool")} defaultValue={section} wrapperClassName="w-auto sm:max-w-xs">` and `<AdminButton type="submit" variant="outline" size="sm">{tc("filter")}</AdminButton>`, with the same options;
    - with no questions: `<AdminEmpty title={tc("noResults")} />`;
    - otherwise `<AdminDisclosureList>`, one `<AdminDisclosure key={q.id} summary={<span className="min-w-0 font-medium">{q.text}</span>}>` per question, holding the `QuestionForm` and then `<form action={deleteQuestion} className="mt-4 flex justify-end border-t pt-4">` with the hidden id and `<AdminButton type="submit" variant="destructive-ghost" size="sm"><Trash2Icon aria-hidden />{tc("delete")}</AdminButton>`;
    - `<div className="border-t"><AdminDisclosure summary={<span className="inline-flex items-center gap-1.5 font-medium text-link"><PlusIcon aria-hidden className="size-4" />{t("new")}</span>}><QuestionForm q={null} … /></AdminDisclosure></div>`.

Verify: format, lint, typecheck, test:unit.

---

### Step 12: remove the compat layer and verify nothing still needs it

Commit: `refactor(admin): drop compat styles for old Admin pages`

1. Run the checks below from the repo root. **Each must print nothing.** If one prints something, fix that file to use the primitives (same rules as its page's step) before going on.

   ```bash
   # a) marketing primitives (only the allowed four may remain)
   rg -n '@/components/(ui|portal|course)/' src/components/admin 'src/app/[locale]/admin' \
     | rg -v 'ui/dropdown-menu|ui/sheet|portal/dashboard|course/blocks/block-renderer'
   # b) reference-design classes and old sizes
   rg -n 'lms-|border-line-blue|divide-line-blue|bg-hero|bg-surface|bg-blue-tint|text-blue-text|text-alert|bg-alert|alert-line|text-green-ink|bg-brand-green|rounded-\[(1[0-9]|2[0-9])px\]|text-\[15px\]|text-3xl|text-xl|font-bold|bg-primary px-|rounded-md border bg-background px-2' \
     src/components/admin 'src/app/[locale]/admin'
   # c) bare form controls: every hit must be type="hidden", a checkbox/radio with adminCheckClass, or inside ui/{input,select,textarea,field}.tsx
   rg -U --pcre2 -n '<(input|select|textarea)\b(?![^>]*type="hidden")(?![^>]*adminCheckClass)[^>]*>' \
     src/components/admin 'src/app/[locale]/admin' \
     | rg -v 'src/components/admin/ui/(input|select|textarea|field)\.tsx'
   # d) bare <button> outside primitives and client toggles
   rg -n '<button\b' src/components/admin 'src/app/[locale]/admin' \
     | rg -v 'src/components/admin/(ui/|course-editor\.tsx|theme-toggle\.tsx|account-menu\.tsx|language-menu\.tsx|mobile-nav\.tsx|sidebar)'
   # e) <footer> in Admin
   rg -n '<footer\b' src/components/admin 'src/app/[locale]/admin'
   ```

   In (d), `course-editor.tsx` keeps the raw `<button role="tab">` and the block-type picker buttons, which is intended. Any other raw `<button>` there must be an `AdminButton`. Check that by reading the matches: `rg -n '<button\b' src/components/admin/course-editor.tsx` should show exactly two (the tab and the type picker).

2. `src/styles/admin.css`:
   - Delete the whole `@layer reference { … }` block and its comment `/* Compat for not-yet-restyled Admin pages. Below Tailwind utilities. */`.
   - **Keep** the reference-token lines in both palette blocks (`--ink` … `--blue-tint`). They are still read by marketing components rendered inside the shell: `ui/sheet` (mobile nav), `ui/dropdown-menu`, the portal `Dashboard` on the view-as-Student page and the `BlockRenderer` lesson previews. Change their comment to `/* reference tokens read by marketing parts shown inside the shell (sheet, dropdowns, view-as-Student, lesson previews) */`.
3. Check that nothing else used those compat selectors: `rg -n 'admin-shell' src --glob '!src/styles/admin.css'` must only show `src/components/admin/admin-shell.tsx`.

Verify: format, lint, typecheck, test:unit.

**For the orchestrator, after step 12:** run `pnpm check:locked` (or e2e via `scripts/with-stack-lock.sh`). Then spot-check in the browser, light and dark: `/admin/students`, a Student, `/admin/enrollments/<id>`, `/admin/orders?tab=refunds`, `/admin/reporting`, `/admin/site-content?tab=faq`, `/admin/content/lessons/<id>` (open the editor: inputs, language tabs, AI translate), `/admin/content/questions`, `/admin/students/<id>/view` and the mobile nav sheet.

## 3.10 Visible text that changes (all intended)

- Section H1s now use the sidebar labels:

  | Page | Before | After |
  | --- | --- | --- |
  | Reporting | "Reporting" | "DMV reporting" |
  | Tickets | "Tickets" | "Support requests" |
  | AI | "AI" | "AI assistant" |
  | Orders | "Orders and refunds" | "Orders & refunds" |
  | Content | "Content" | "Course content" |

  The other section H1s already match their sidebar labels. In other languages the H1s follow `Admin.nav`.
- New page descriptions (section 4).
- Status filter chips show translated status names instead of raw values (`active` → `Admin.statuses.active`).
- "(draft)" is now a "draft" badge; "✓ Saved" now shows a check icon; "✨" is now a Sparkles icon; "+ Add …" now shows a plus icon; the ↑/↓ glyphs are now arrow icons; "← Back" now shows an arrow icon.
- Ticket summaries show badges instead of `[type] email · status · date`.

## 4. New message keys (add to all four files at these paths)

| Key | en | ja | es | ru |
| --- | --- | --- | --- | --- |
| `Admin.common.summary` | Summary | 概要 | Resumen | Сводка |
| `Admin.common.pagination` | Pagination | ページ送り | Paginación | Страницы |
| `Admin.statuses.refunded` | refunded | 返金済み | reembolsado | возвращён |
| `Admin.statuses.partially_refunded` | partially refunded | 一部返金 | reembolso parcial | частично возвращён |
| `Admin.statuses.approved` | approved | 承認済み | aprobado | одобрен |
| `Admin.statuses.queued` | queued | 送信待ち | en cola | в очереди |
| `Admin.statuses.sent` | sent | 送信済み | enviado | отправлен |
| `Admin.statuses.accepted` | accepted | 受理 | aceptado | принят |
| `Admin.statuses.error` | error | エラー | error | ошибка |
| `Admin.students.question` | Question | 質問 | Pregunta | Вопрос |
| `Admin.students.result` | Result | 結果 | Resultado | Результат |
| `Admin.students.refunds` | Refunds | 返金 | Reembolsos | Возвраты |
| `Admin.students.action` | Action | 操作 | Acción | Действие |
| `Admin.tickets.filterType` | Filter by type | 種類で絞り込み | Filtrar por tipo | Фильтр по типу |
| `Admin.tickets.filterStatus` | Filter by status | 状態で絞り込み | Filtrar por estado | Фильтр по статусу |
| `Admin.ai.pickConversation` | Pick a conversation to read its transcript. | 会話を選ぶと会話履歴が表示されます。 | Elige una conversación para leer la transcripción. | Выберите диалог, чтобы прочитать стенограмму. |

New namespace `Admin.descriptions` (put it right after `Admin.stageHints`):

| Key | en | ja | es | ru |
| --- | --- | --- | --- | --- |
| `students` | Everyone with a student account. Search by name, email, license or citation number. | 受講者アカウントの一覧です。氏名、メール、免許番号、違反切符番号で検索できます。 | Todas las cuentas de estudiante. Busca por nombre, correo, licencia o número de citación. | Все учётные записи студентов. Ищите по имени, email, номеру прав или номеру штрафа. |
| `enrollments` | Every course enrollment, newest first. | すべての受講登録(新しい順)。 | Todas las inscripciones a cursos, de la más reciente a la más antigua. | Все записи на курс, сначала новые. |
| `orders` | Payments, and the refund requests waiting for a decision. | 支払いと、判断待ちの返金申請。 | Pagos y solicitudes de reembolso pendientes de decisión. | Платежи и запросы на возврат, ожидающие решения. |
| `reporting` | Completion reports to the DMV: what needs fixing, every report, and past batches. | DMVへの修了報告:要対応の報告、すべての報告、過去のバッチ。 | Informes de finalización al DMV: los que hay que corregir, todos los informes y los lotes anteriores. | Отчёты о прохождении в DMV: что нужно исправить, все отчёты и прошлые пакеты. |
| `questions` | Quiz and final exam questions. Correct answers are shown only here. | 小テストと修了試験の問題。正解はこの画面にのみ表示されます。 | Preguntas de cuestionarios y del examen final. Las respuestas correctas solo se muestran aquí. | Вопросы тестов и итогового экзамена. Правильные ответы видны только здесь. |
| `siteContent` | Public pages, FAQ, announcements and prices, per language. | 公開ページ、FAQ、お知らせ、価格(言語別)。 | Páginas públicas, preguntas frecuentes, avisos y precios, por idioma. | Публичные страницы, FAQ, объявления и цены по языкам. |
| `tickets` | Messages from the contact form, bug reports, ADA requests and AI handoffs. | お問い合わせフォーム、不具合報告、ADA依頼、AIからの引き継ぎ。 | Mensajes del formulario de contacto, informes de errores, solicitudes ADA y derivaciones de la IA. | Сообщения из формы связи, отчёты об ошибках, запросы ADA и передачи от ИИ. |
| `ai` | Assistant usage, cost and conversations. Flag answers that need review. | アシスタントの利用状況、コスト、会話。確認が必要な回答にフラグを付けます。 | Uso, coste y conversaciones del asistente. Marca las respuestas que haya que revisar. | Использование, стоимость и диалоги ассистента. Отмечайте ответы, которые нужно проверить. |
| `settings` | Admin accounts, state config, waitlists and email templates. | 管理者アカウント、州の設定、ウェイトリスト、メールテンプレート。 | Cuentas de administrador, configuración por estado, listas de espera y plantillas de correo. | Учётные записи администраторов, настройки штатов, листы ожидания и шаблоны писем. |

Courts uses its existing `Admin.courts.hint` as its description, and Course content uses `Admin.editor.intro`.

## 5. Risks

- **`AdminSelect` wraps the `<select>` in a `<span>`.** `AiTranslate` finds controls through `form.elements`, so the wrapper does not matter to it. `getByLabel` works because `AdminField` is the `<label>`.
- **Stale typed messages.** Messages are typed from `en.json` (`src/global.d.ts`), so add the keys in step 1 before any page uses them.
- **`aria-current="page"` on filter chips and tabs.** The e2e test only reads `aria-current` inside the "Admin sections" nav, so these do not collide with it.
- **Removing `@layer reference`.** If a bare control is missed, it falls back to browser defaults. The step 12 greps (c) and (d) catch it.
- **No new confirm prompts.** Deletes that never asked first still do not ask. This is intentional (no behavior change), and the owner may want to revisit it later.
