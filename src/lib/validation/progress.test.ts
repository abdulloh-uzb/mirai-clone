import { describe, expect, it } from "vitest";
import { mapProgressError, progressInputSchema } from "./progress";

describe("progress validation", () => {
  it("maps database errors to keys", () => {
    expect(mapProgressError("min_time_not_met")).toBe("minTimeNotMet");
    expect(mapProgressError("x lesson_locked y")).toBe("lessonLocked");
    expect(mapProgressError("boom")).toBe("generic");
  });
  it("rejects bad input", () => {
    const base = {
      enrollmentId: crypto.randomUUID(),
      lessonId: crypto.randomUUID(),
      seconds: 15,
      blockPosition: 1,
    };
    expect(progressInputSchema.safeParse(base).success).toBe(true);
    expect(
      progressInputSchema.safeParse({ ...base, seconds: -1 }).success,
    ).toBe(false);
    expect(
      progressInputSchema.safeParse({ ...base, lessonId: "nope" }).success,
    ).toBe(false);
  });
});
