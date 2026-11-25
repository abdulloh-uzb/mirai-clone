import { describe, expect, it } from "vitest";
import { parseTicketState } from "./citation-state";

describe("parseTicketState", () => {
  it("keeps a two-letter uppercase code", () => {
    expect(parseTicketState("TX")).toBe("TX");
  });
  it("falls back to California", () => {
    for (const value of ["tx", "TEX", "", undefined, 5, "T1"]) {
      expect(parseTicketState(value)).toBe("CA");
    }
  });
});
