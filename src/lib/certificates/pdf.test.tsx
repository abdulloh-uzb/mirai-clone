import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("renderCertificatePdf", () => {
  it("returns a PDF", async () => {
    const { renderCertificatePdf } = await import("./pdf");
    const buf = await renderCertificatePdf({
      legalName: "Alex Driver",
      maskedLicense: "****4567",
      court: "Example County Superior Court",
      citationNo: "AB-123",
      completedOn: "2026-11-26",
      certNo: "RR-2026-1A2B3C4D",
      courseLanguage: "English",
      verifyUrl: "http://localhost:3000/verify/RR-2026-1A2B3C4D",
    });
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");
  });
});
