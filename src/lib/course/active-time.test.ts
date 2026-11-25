import { describe, expect, it } from "vitest";
import { isActive } from "./active-time";

describe("isActive", () => {
  it("is active with recent input and a visible tab", () => {
    expect(isActive(100_000, 0, true)).toBe(true);
    expect(isActive(120_000, 0, true)).toBe(true);
  });
  it("is inactive after 2 minutes without input", () => {
    expect(isActive(120_001, 0, true)).toBe(false);
  });
  it("is inactive when the tab is hidden", () => {
    expect(isActive(1000, 0, false)).toBe(false);
  });
});
