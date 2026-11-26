import { describe, expect, it } from "vitest";
import {
  attentionHref,
  attentionViewAllHref,
  groupAttention,
  ticketTypeOf,
  toActivityPoints,
  toStageCounts,
  type AttentionRow,
} from "./dashboard-view";

function row(over: Partial<AttentionRow>): AttentionRow {
  return {
    kind: "ticket_open",
    ref_id: "ref",
    user_id: "user",
    user_name: "",
    user_email: "",
    detail: "contact",
    amount_cents: 0,
    due_date: "",
    since: "2026-11-01T00:00:00Z",
    total: 1,
    ...over,
  };
}

describe("dashboard view", () => {
  it("fills missing stages with zero", () => {
    expect(toStageCounts([{ stage: "studying", students: 4 }])).toEqual({
      registered: 0,
      studying: 4,
      needs_attention: 0,
      completed: 0,
      reported: 0,
    });
  });

  it("groups attention rows in a fixed order and drops unknown kinds", () => {
    const groups = groupAttention([
      row({ kind: "ticket_open", total: 7 }),
      row({ kind: "mystery" }),
      row({ kind: "report_failed", total: 2 }),
      row({ kind: "report_failed", total: 2 }),
    ]);
    expect(groups.map((g) => g.kind)).toEqual(["report_failed", "ticket_open"]);
    expect(groups[0]).toMatchObject({ total: 2 });
    expect(groups[0]!.items).toHaveLength(2);
    expect(groups[1]).toMatchObject({ total: 7 });
  });

  it("links each kind to the page that fixes it", () => {
    expect(
      attentionHref({ ...row({ detail: "rejected" }), kind: "report_failed" }),
    ).toBe("/admin/reporting?status=rejected");
    expect(
      attentionHref({ ...row({ ref_id: "o1" }), kind: "refund_requested" }),
    ).toBe("/admin/orders/o1");
    expect(
      attentionHref({ ...row({ ref_id: "e1" }), kind: "enrollment_blocked" }),
    ).toBe("/admin/enrollments/e1");
    expect(attentionHref({ ...row({}), kind: "ticket_open" })).toBe(
      "/admin/tickets?status=open",
    );
    expect(
      attentionHref({ ...row({ user_id: "u1" }), kind: "court_due_soon" }),
    ).toBe("/admin/students/u1");
  });

  it("gives a View all link for every kind except court dates", () => {
    expect(attentionViewAllHref("report_failed")).toBe("/admin/reporting");
    expect(attentionViewAllHref("refund_requested")).toBe(
      "/admin/orders?tab=refunds",
    );
    expect(attentionViewAllHref("enrollment_blocked")).toBe(
      "/admin/students?stage=needs_attention",
    );
    expect(attentionViewAllHref("ticket_open")).toBe(
      "/admin/tickets?status=open",
    );
    expect(attentionViewAllHref("court_due_soon")).toBeNull();
  });

  it("recognises ticket types", () => {
    expect(ticketTypeOf("ada")).toBe("ada");
    expect(ticketTypeOf("nope")).toBeUndefined();
  });

  it("turns activity rows into chart points with sales in dollars", () => {
    expect(
      toActivityPoints(
        [{ day: "2026-11-26", sales_cents: 2499, enrollments: 1 }],
        (d) => `day ${d}`,
      ),
    ).toEqual([{ label: "day 2026-11-26", sales: 24.99, enrollments: 1 }]);
  });
});
