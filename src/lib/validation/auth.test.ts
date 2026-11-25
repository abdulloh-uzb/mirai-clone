import { describe, expect, it } from "vitest";
import { localeSchema, signInSchema, signUpSchema } from "./auth";

describe("localeSchema", () => {
  it("accepts a UI language", () => {
    expect(localeSchema.parse("ja")).toBe("ja");
  });

  it.each([undefined, "", "fr", 7])("falls back to English for %s", (value) => {
    expect(localeSchema.parse(value)).toBe("en");
  });
});

const validSignUp = {
  firstName: "Aiko",
  lastName: "Tanaka",
  email: "aiko@example.test",
  password: "longenough1",
  preferredLocale: "ja",
};

function errorFor(
  result: {
    success: boolean;
    error?: { issues: { path: PropertyKey[]; message: string }[] };
  },
  field: string,
) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

describe("signUpSchema", () => {
  it("accepts a complete sign-up", () => {
    expect(signUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it("trims names and normalizes the email", () => {
    const parsed = signUpSchema.parse({
      ...validSignUp,
      firstName: "  Aiko ",
      lastName: " Tanaka  ",
      email: "  Aiko@Example.TEST ",
    });

    expect(parsed).toMatchObject({
      firstName: "Aiko",
      lastName: "Tanaka",
      email: "aiko@example.test",
    });
  });

  it.each([
    ["firstName", { firstName: "   " }, "firstNameRequired"],
    ["lastName", { lastName: "" }, "lastNameRequired"],
    ["firstName", { firstName: "x".repeat(51) }, "nameTooLong"],
    ["email", { email: "not-an-email" }, "emailInvalid"],
    ["password", { password: "short1" }, "passwordTooShort"],
    ["password", { password: "x".repeat(73) }, "passwordTooLong"],
    ["preferredLocale", { preferredLocale: "fr" }, "localeInvalid"],
  ])(
    "rejects an invalid %s with a translatable message",
    (field, change, key) => {
      const result = signUpSchema.safeParse({ ...validSignUp, ...change });

      expect(result.success).toBe(false);
      expect(errorFor(result, field)).toBe(key);
    },
  );

  it("requires every field", () => {
    const result = signUpSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path[0]).sort()).toEqual([
      "email",
      "firstName",
      "lastName",
      "password",
      "preferredLocale",
    ]);
  });
});

describe("signInSchema", () => {
  it("accepts an email and any non-empty password", () => {
    // Sign-in must not re-apply sign-up password rules: that would leak them
    // and lock out accounts created under older rules.
    const result = signInSchema.safeParse({
      email: "Student@Example.test",
      password: "x",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("student@example.test");
  });

  it.each([
    ["email", { email: "nope", password: "secret" }, "emailInvalid"],
    ["password", { email: "a@example.test", password: "" }, "passwordRequired"],
  ])("rejects an invalid %s", (field, input, key) => {
    const result = signInSchema.safeParse(input);

    expect(result.success).toBe(false);
    expect(errorFor(result, field)).toBe(key);
  });
});
