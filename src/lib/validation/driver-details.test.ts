import { describe, expect, it } from "vitest";
import { makeDriverDetailsSchema } from "./driver-details";

const NOW = new Date("2026-06-15T12:00:00Z");
const schema = makeDriverDetailsSchema({
  now: NOW,
  requireSecurityAnswer: true,
});

const valid = {
  legalName: "Alex Driver",
  dob: "1990-05-17",
  licenseNo: "A1234567",
  licenseState: "CA",
  phone: "+1 555 010 0199",
  countySlug: "los-angeles-county",
  citationNo: "ab-123",
  courtDueDate: "2026-07-01",
  securityQuestion: "first_car",
  securityAnswer: "Civic",
};

function messages(overrides: Record<string, unknown>) {
  const result = schema.safeParse({ ...valid, ...overrides });
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("driverDetailsSchema", () => {
  it("accepts valid details and upper-cases the citation", () => {
    const result = schema.safeParse(valid);
    expect(result.success && result.data.citationNo).toBe("AB-123");
  });

  it("rejects placeholder dates of birth", () => {
    expect(messages({ dob: "1900-01-01" })).toContain("dobPlaceholder");
    expect(messages({ dob: "1900-02-02" })).toContain("dobPlaceholder");
  });

  it("limits age to 15-100", () => {
    expect(messages({ dob: "2011-06-16" })).toContain("dobAge"); // 14
    expect(messages({ dob: "2011-06-15" })).toEqual([]); // 15
    expect(messages({ dob: "1925-06-15" })).toContain("dobAge"); // 101
  });

  it("checks the California license format only for CA", () => {
    expect(messages({ licenseNo: "12345678" })).toContain("licenseFormat");
    expect(messages({ licenseNo: "a1234567" })).toContain("licenseFormat");
    expect(messages({ licenseState: "NV", licenseNo: "12-345-678" })).toEqual(
      [],
    );
  });

  it("rejects bad citation numbers and past due dates", () => {
    expect(messages({ citationNo: "AB#1" })).toContain("citationFormat");
    expect(messages({ courtDueDate: "2026-06-14" })).toContain("dueDatePast");
    expect(messages({ courtDueDate: "2026-06-15" })).toEqual([]);
  });

  it("requires the security answer only when asked to", () => {
    expect(messages({ securityAnswer: "" })).toContain("securityAnswerShort");
    const optional = makeDriverDetailsSchema({
      now: NOW,
      requireSecurityAnswer: false,
    });
    expect(optional.safeParse({ ...valid, securityAnswer: "" }).success).toBe(
      true,
    );
  });
});
