import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const base = {
  legalName: "Alex Driver",
  maskedLicense: "****4567",
  court: "Example County Superior Court",
  citationNo: "AB-123",
  completedOn: "2026-11-26",
  certNo: "RR-2026-1A2B3C4D",
  verifyUrl: "http://localhost:3000/verify/RR-2026-1A2B3C4D",
};

describe("renderCertificatePdf", () => {
  it.each([
    ["en", "English"],
    ["es", "Español"],
    ["ru", "Русский"],
    ["ja", "日本語"],
  ] as const)("returns a PDF in %s", async (locale, courseLanguage) => {
    const { renderCertificatePdf } = await import("./pdf");
    const buf = await renderCertificatePdf({
      ...base,
      locale,
      courseLanguage,
      legalName: locale === "ru" ? "Алексей Иванов" : base.legalName,
    });
    expect(buf.subarray(0, 4).toString()).toBe("%PDF");
    expect(buf.length).toBeGreaterThan(5000);
  });
});
