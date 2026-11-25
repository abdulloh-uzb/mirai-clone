import { describe, expect, it } from "vitest";
import {
  adaSchema,
  bugReportSchema,
  contactSchema,
  screenshotError,
  SCREENSHOT_MAX_BYTES,
  screenshotSchema,
} from "./support";

function firstError(
  result: {
    success: boolean;
    error?: { issues: { path: PropertyKey[]; message: string }[] };
  },
  field: string,
) {
  return result.error?.issues.find((issue) => issue.path[0] === field)?.message;
}

const contact = {
  name: "Aiko Tanaka",
  email: " Aiko@Example.test ",
  topic: "course",
  message: "I have a question about the course.",
};

describe("contactSchema", () => {
  it("accepts valid input and normalises the email", () => {
    const result = contactSchema.safeParse(contact);
    expect(result.data).toMatchObject({
      email: "aiko@example.test",
      topic: "course",
    });
  });

  it.each([
    [{ name: " " }, "name", "nameRequired"],
    [{ name: "x".repeat(101) }, "name", "nameTooLong"],
    [{ email: "nope" }, "email", "emailInvalid"],
    [{ topic: "other" }, "topic", "topicInvalid"],
    [{ message: "short" }, "message", "messageTooShort"],
    [{ message: "x".repeat(5001) }, "message", "messageTooLong"],
  ])("reports %j on %s as %s", (patch, field, key) => {
    const result = contactSchema.safeParse({ ...contact, ...patch });
    expect(firstError(result, field)).toBe(key);
  });
});

describe("adaSchema", () => {
  const ada = {
    name: "Sam",
    email: "sam@example.test",
    need: "I need extra time on the exam.",
    preferredContact: "email",
  };

  it("accepts valid input with an optional phone", () => {
    expect(adaSchema.safeParse(ada).success).toBe(true);
    const blank = adaSchema.safeParse({ ...ada, phone: "" });
    expect(blank.data?.phone).toBeUndefined();
  });

  it("requires a phone when phone is the preferred contact", () => {
    const result = adaSchema.safeParse({ ...ada, preferredContact: "phone" });
    expect(firstError(result, "phone")).toBe("phoneRequired");
  });

  it("rejects bad enums and long phones", () => {
    const badContact = adaSchema.safeParse({ ...ada, preferredContact: "fax" });
    expect(firstError(badContact, "preferredContact")).toBe(
      "preferredContactInvalid",
    );
    const longPhone = adaSchema.safeParse({ ...ada, phone: "1".repeat(31) });
    expect(firstError(longPhone, "phone")).toBe("phoneTooLong");
  });
});

describe("bugReportSchema", () => {
  it("accepts valid input and rejects a short description", () => {
    const valid = {
      whatHappened: "The page froze on submit.",
      email: "a@example.test",
      pageUrl: "http://x/y",
    };
    expect(bugReportSchema.safeParse(valid).success).toBe(true);
    const short = bugReportSchema.safeParse({ ...valid, whatHappened: "bad" });
    expect(firstError(short, "whatHappened")).toBe("messageTooShort");
  });
});

describe("screenshots", () => {
  it("checks type and size", () => {
    expect(screenshotError({ type: "image/png", size: 10 })).toBeNull();
    expect(screenshotError({ type: "image/gif", size: 10 })).toBe(
      "screenshotType",
    );
    expect(
      screenshotError({ type: "image/webp", size: SCREENSHOT_MAX_BYTES + 1 }),
    ).toBe("screenshotTooLarge");
  });

  it("the server schema accepts no file or a valid File only", () => {
    const png = new File(["x"], "a.png", { type: "image/png" });
    const gif = new File(["x"], "a.gif", { type: "image/gif" });
    expect(screenshotSchema.safeParse(undefined).success).toBe(true);
    expect(screenshotSchema.safeParse(png).success).toBe(true);
    expect(screenshotSchema.safeParse(gif).success).toBe(false);
    expect(screenshotSchema.safeParse("text").success).toBe(false);
  });
});
