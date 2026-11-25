import { describe, expect, it } from "vitest";
import { calculateRefund } from "./refund";

const DAY = 24 * 60 * 60 * 1000;
const paidAt = new Date("2026-03-01T12:00:00Z");
const at = (ms: number) => new Date(paidAt.getTime() + ms);
const order = { paidAt, amountCents: 2499, status: "paid" };
const fresh = {
  lessonsStarted: false,
  examStarted: false,
  certificateIssued: false,
};

describe("calculateRefund", () => {
  it("gives 100% on day 0 with nothing started", () => {
    expect(calculateRefund(order, fresh, at(0))).toEqual({
      pct: 100,
      amountCents: 2499,
      reason: "full_window_unstarted",
    });
  });

  it("treats exactly 7 days as inside the window", () => {
    expect(calculateRefund(order, fresh, at(7 * DAY)).pct).toBe(100);
  });

  it("gives 0% one millisecond after 7 days", () => {
    expect(calculateRefund(order, fresh, at(7 * DAY + 1))).toEqual({
      pct: 0,
      amountCents: 0,
      reason: "outside_window",
    });
  });

  it("gives 50% when lessons started at day 3 (odd cents round)", () => {
    expect(
      calculateRefund(order, { ...fresh, lessonsStarted: true }, at(3 * DAY)),
    ).toEqual({ pct: 50, amountCents: 1250, reason: "half_window_started" });
  });

  it("gives 0% when the exam started at day 2", () => {
    const e = { ...fresh, lessonsStarted: true, examStarted: true };
    expect(calculateRefund(order, e, at(2 * DAY))).toEqual({
      pct: 0,
      amountCents: 0,
      reason: "exam_started",
    });
  });

  it("gives 0% when a certificate was issued at day 1", () => {
    const e = {
      lessonsStarted: true,
      examStarted: true,
      certificateIssued: true,
    };
    expect(calculateRefund(order, e, at(DAY)).reason).toBe(
      "certificate_issued",
    );
  });

  it("gives 0% for an order that is not paid", () => {
    for (const status of ["pending", "refunded", "failed"]) {
      expect(calculateRefund({ ...order, status }, fresh, at(0))).toEqual({
        pct: 0,
        amountCents: 0,
        reason: "not_paid",
      });
    }
  });

  it("treats no enrollment as nothing started", () => {
    expect(calculateRefund(order, null, at(DAY)).pct).toBe(100);
  });

  it("gives 0% outside the window even when nothing started", () => {
    expect(calculateRefund(order, null, at(30 * DAY)).reason).toBe(
      "outside_window",
    );
  });
});
