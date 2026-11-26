import { describe, expect, it } from "vitest";
import { certificateNumberValid, maskLicense } from "./mask";

describe("maskLicense", () => {
  it("keeps only the last four characters", () => {
    expect(maskLicense("A1234567")).toBe("****4567");
  });
  it("masks short numbers completely", () => {
    expect(maskLicense("123")).toBe("***");
  });
});

describe("certificateNumberValid", () => {
  it("accepts the issued format in any case", () => {
    expect(certificateNumberValid("RR-2026-1A2B3C4D")).toBe(true);
    expect(certificateNumberValid(" rr-2026-1a2b3c4d ")).toBe(true);
  });
  it("rejects other input", () => {
    expect(certificateNumberValid("RR-2026-XYZ")).toBe(false);
    expect(certificateNumberValid("")).toBe(false);
  });
});
