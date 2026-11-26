import type { Database } from "@/lib/database.types";
import { STUDENT_STAGES, type StudentStage } from "./stages";

type Fns = Database["public"]["Functions"];
export type AttentionRow = Fns["admin_attention_items"]["Returns"][number];
export type StageCountRow = Fns["admin_stage_counts"]["Returns"][number];
export type ActivityRow = Fns["admin_daily_activity"]["Returns"][number];

export const ATTENTION_KINDS = [
  "report_failed",
  "refund_requested",
  "enrollment_blocked",
  "ticket_open",
  "court_due_soon",
] as const;
export type AttentionKind = (typeof ATTENTION_KINDS)[number];

export const TICKET_TYPES = ["contact", "bug", "ada", "ai_handoff"] as const;

/** One count per stage, zero for stages the database did not return. */
export function toStageCounts(
  rows: StageCountRow[],
): Record<StudentStage, number> {
  const counts = Object.fromEntries(
    STUDENT_STAGES.map((s) => [s, 0]),
  ) as Record<StudentStage, number>;
  for (const row of rows) counts[row.stage] = row.students;
  return counts;
}

/** Rows grouped by kind in a fixed order; empty and unknown kinds are dropped. */
export function groupAttention(
  rows: AttentionRow[],
): { kind: AttentionKind; total: number; items: AttentionRow[] }[] {
  const groups: {
    kind: AttentionKind;
    total: number;
    items: AttentionRow[];
  }[] = [];
  for (const kind of ATTENTION_KINDS) {
    const items = rows.filter((r) => r.kind === kind);
    if (items.length === 0) continue;
    groups.push({ kind, total: items[0]!.total, items });
  }
  return groups;
}

/** The page that fixes this row. */
export function attentionHref(
  row: AttentionRow & { kind: AttentionKind },
): string {
  switch (row.kind) {
    case "report_failed":
      return `/admin/reporting?status=${row.detail}`;
    case "refund_requested":
      return `/admin/orders/${row.ref_id}`;
    case "enrollment_blocked":
      return `/admin/enrollments/${row.ref_id}`;
    case "ticket_open":
      return "/admin/tickets?status=open";
    case "court_due_soon":
      return `/admin/students/${row.user_id}`;
  }
}

/** Where "View all" goes for a kind, or null when there is no such page. */
export function attentionViewAllHref(kind: AttentionKind): string | null {
  switch (kind) {
    case "report_failed":
      return "/admin/reporting";
    case "refund_requested":
      return "/admin/orders?tab=refunds";
    case "enrollment_blocked":
      return "/admin/students?stage=needs_attention";
    case "ticket_open":
      return "/admin/tickets?status=open";
    case "court_due_soon":
      return null;
  }
}

export function ticketTypeOf(
  detail: string,
): (typeof TICKET_TYPES)[number] | undefined {
  return TICKET_TYPES.find((t) => t === detail);
}

/** Chart points; `sales` is in dollars. */
export function toActivityPoints(
  rows: ActivityRow[],
  formatDay: (day: string) => string,
): { label: string; sales: number; enrollments: number }[] {
  return rows.map((r) => ({
    label: formatDay(r.day),
    sales: r.sales_cents / 100,
    enrollments: r.enrollments,
  }));
}
