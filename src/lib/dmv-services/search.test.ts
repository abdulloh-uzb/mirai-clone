import { describe, expect, it } from "vitest";
import { matchesTile } from "./search";

const tile = {
  title: "Renew your driver licence",
  keywords: "license DL renewal expired",
};

describe("matchesTile", () => {
  it("matches everything on an empty query", () => {
    expect(matchesTile(tile, "  ")).toBe(true);
  });
  it("matches a substring of the title, ignoring case", () => {
    expect(matchesTile(tile, "DRIVER lic")).toBe(true);
  });
  it("matches a keyword the title does not contain", () => {
    expect(matchesTile(tile, "expired")).toBe(true);
  });
  it("ignores accents on both sides", () => {
    expect(
      matchesTile({ title: "Renovación", keywords: "" }, "renovacion"),
    ).toBe(true);
    expect(
      matchesTile({ title: "Renovacion", keywords: "" }, "renovación"),
    ).toBe(true);
  });
  it("does not match unrelated text", () => {
    expect(matchesTile(tile, "boat")).toBe(false);
  });
});
