import { describe, expect, it } from "vitest";
import { accessBanner, daysLeft, dueDateWarning } from "./access";

const now = new Date("2026-06-01T12:00:00");

describe("access", () => {
  it("counts days left, rounded up and never negative", () => {
    expect(daysLeft("2026-06-11T12:00:00", now)).toBe(10);
    expect(daysLeft("2026-06-01T13:00:00", now)).toBe(1);
    expect(daysLeft("2026-05-01T12:00:00", now)).toBe(0);
    expect(daysLeft(null, now)).toBe(0);
  });
  it("picks the banner", () => {
    expect(accessBanner(30)).toBeNull();
    expect(accessBanner(15)).toBeNull();
    expect(accessBanner(14)).toBe(14);
    expect(accessBanner(8)).toBe(14);
    expect(accessBanner(7)).toBe(7);
    expect(accessBanner(2)).toBe(7);
    expect(accessBanner(1)).toBe(1);
    expect(accessBanner(0)).toBe(1);
  });
  it("warns about the court due date", () => {
    expect(dueDateWarning(null, now)).toBeNull();
    expect(dueDateWarning("2026-05-31", now)).toBe("overdue");
    expect(dueDateWarning("2026-06-01", now)).toBe("soon");
    expect(dueDateWarning("2026-06-08", now)).toBe("soon");
    expect(dueDateWarning("2026-06-09", now)).toBeNull();
  });
});
