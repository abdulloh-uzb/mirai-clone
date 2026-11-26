import { describe, expect, it } from "vitest";
import {
  isReportingSlot,
  MAX_ATTEMPTS,
  nextBackoff,
  nextReportingSlot,
} from "./schedule";

describe("isReportingSlot", () => {
  it("matches 09:00, 13:00 and 17:00 Los Angeles time in winter (PST)", () => {
    expect(isReportingSlot(new Date("2026-01-15T17:00:00Z"))).toBe(true);
    expect(isReportingSlot(new Date("2026-01-15T21:00:00Z"))).toBe(true);
    expect(isReportingSlot(new Date("2026-01-16T01:00:00Z"))).toBe(true);
  });
  it("matches the same local times in summer (PDT)", () => {
    expect(isReportingSlot(new Date("2026-07-15T16:00:00Z"))).toBe(true);
    expect(isReportingSlot(new Date("2026-07-15T20:00:00Z"))).toBe(true);
    expect(isReportingSlot(new Date("2026-07-16T00:00:00Z"))).toBe(true);
  });
  it("does not match other hours", () => {
    expect(isReportingSlot(new Date("2026-07-15T17:00:00Z"))).toBe(false);
    expect(isReportingSlot(new Date("2026-01-15T16:00:00Z"))).toBe(false);
  });
});

describe("nextBackoff", () => {
  it("grows and caps", () => {
    expect([1, 2, 3, 4, 5].map(nextBackoff)).toEqual([5, 15, 60, 180, 720]);
    expect(nextBackoff(9)).toBe(720);
    expect(MAX_ATTEMPTS).toBe(5);
  });
});

describe("nextReportingSlot", () => {
  it("returns the next top-of-hour slot", () => {
    expect(
      nextReportingSlot(new Date("2026-07-15T16:30:00Z")).toISOString(),
    ).toBe("2026-07-15T20:00:00.000Z");
    expect(
      nextReportingSlot(new Date("2026-07-15T16:00:00Z")).toISOString(),
    ).toBe("2026-07-15T20:00:00.000Z");
  });
});
