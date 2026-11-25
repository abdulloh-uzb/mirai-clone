import { describe, expect, it } from "vitest";
import {
  examPayloadSchema,
  formatRemaining,
  isExamPath,
  unansweredCount,
} from "./exam";

const id = "6f1c2f0e-5b1e-4f6e-9a55-1d6c7b0f3a11";

describe("exam payload schema", () => {
  const base = {
    attemptId: id,
    attemptNo: 1,
    expiresAt: "2026-01-01T00:00:00Z",
    answers: {},
  };
  it("accepts questions without correctness", () => {
    const ok = examPayloadSchema.safeParse({
      ...base,
      questions: [{ id, text: "Q", options: [{ id, text: "A" }] }],
    });
    expect(ok.success).toBe(true);
  });
  it("rejects a correctness field on an option", () => {
    const bad = examPayloadSchema.safeParse({
      ...base,
      questions: [
        { id, text: "Q", options: [{ id, text: "A", is_correct: true }] },
      ],
    });
    expect(bad.success).toBe(false);
  });
});

describe("formatRemaining", () => {
  it("formats minutes and seconds", () => {
    expect(formatRemaining(61_000)).toBe("01:01");
    expect(formatRemaining(3_600_000)).toBe("1:00:00");
    expect(formatRemaining(-5)).toBe("00:00");
  });
});

describe("isExamPath", () => {
  it("matches exam pages only", () => {
    expect(isExamPath("/portal/exam/abc")).toBe(true);
    expect(isExamPath("/ru/portal/exam/abc")).toBe(true);
    expect(isExamPath("/portal/course/abc/1")).toBe(false);
    expect(isExamPath("/portal/examples")).toBe(false);
  });
});

describe("unansweredCount", () => {
  it("counts missing answers", () => {
    expect(unansweredCount([{ id: "a" }, { id: "b" }], { a: "x" })).toBe(1);
  });
});
