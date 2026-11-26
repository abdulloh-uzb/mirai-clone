import { describe, expect, it } from "vitest";
import { parseConsent, serializeConsent } from "./consent";

describe("consent cookie", () => {
  it("reads the choice among other cookies", () => {
    expect(parseConsent("a=1; consent=analytics; b=2")).toBe("analytics");
    expect(parseConsent("consent=none")).toBe("none");
  });
  it("treats missing or unknown values as not chosen", () => {
    expect(parseConsent("")).toBeNull();
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("consent=yes")).toBeNull();
    expect(parseConsent("xconsent=analytics")).toBeNull();
  });
  it("lasts one year", () => {
    expect(serializeConsent("none")).toContain("Max-Age=31536000");
  });
});
