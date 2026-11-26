import { describe, expect, it } from "vitest";
import {
  avgCompletionDays,
  dashboardStatsSchema,
  passRatePct,
  reportsWaiting,
} from "./dashboard-stats";

const base = {
  sales_cents: { today: 0, d7: 0, d30: 0 },
  enrollments: { today: 0, d7: 0, d30: 0 },
  exam_submitted: 0,
  exam_passed: 0,
  avg_completion_seconds: null,
  reports_by_status: {},
  refunds_30d: { count: 0, cents: 0 },
  ai_chats_7d: 0,
};

describe("dashboard stats", () => {
  it("has no pass rate before any exam is submitted", () => {
    expect(passRatePct(dashboardStatsSchema.parse(base))).toBeNull();
  });

  it("rounds the pass rate", () => {
    const s = dashboardStatsSchema.parse({
      ...base,
      exam_submitted: 3,
      exam_passed: 2,
    });
    expect(passRatePct(s)).toBe(67);
  });

  it("converts completion seconds to days", () => {
    const s = dashboardStatsSchema.parse({
      ...base,
      avg_completion_seconds: 129600,
    });
    expect(avgCompletionDays(s)).toBe(1.5);
  });

  it("counts completion reports waiting for the DMV", () => {
    const s = dashboardStatsSchema.parse({
      ...base,
      reports_by_status: { queued: 2, sent: 3, accepted: 9 },
    });
    expect(reportsWaiting(s)).toEqual({ queued: 2, sent: 3, total: 5 });
    expect(reportsWaiting(dashboardStatsSchema.parse(base))).toEqual({
      queued: 0,
      sent: 0,
      total: 0,
    });
  });
});
