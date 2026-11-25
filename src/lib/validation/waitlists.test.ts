import { describe, expect, it } from "vitest";
import { classroomWaitlistSchema, stateWaitlistSchema } from "./waitlists";

describe("stateWaitlistSchema", () => {
  it("accepts an email and a state code", () => {
    expect(
      stateWaitlistSchema.safeParse({ email: "a@b.co", stateCode: "TX" })
        .success,
    ).toBe(true);
  });
  it("reports translated keys", () => {
    const badEmail = stateWaitlistSchema.safeParse({
      email: "x",
      stateCode: "TX",
    });
    expect(badEmail.error?.issues[0]?.message).toBe("emailInvalid");
    const badState = stateWaitlistSchema.safeParse({
      email: "a@b.co",
      stateCode: "tx",
    });
    expect(badState.error?.issues[0]?.message).toBe("stateInvalid");
  });
});

describe("classroomWaitlistSchema", () => {
  it("needs an email and a County", () => {
    expect(
      classroomWaitlistSchema.safeParse({
        email: "a@b.co",
        countySlug: "kern-county",
      }).success,
    ).toBe(true);
    const missing = classroomWaitlistSchema.safeParse({
      email: "a@b.co",
      countySlug: "",
    });
    expect(missing.error?.issues[0]?.message).toBe("countyInvalid");
  });
});
