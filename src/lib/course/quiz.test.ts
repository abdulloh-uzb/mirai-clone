import { describe, expect, it } from "vitest";
import {
  allAnswered,
  mapQuizError,
  quizPayloadSchema,
  quizQuestionSchema,
} from "./quiz";

const id = "6f1f2c0e-6b1e-4b57-8c36-0d3f3a9d1b11";

describe("quiz question schema", () => {
  it("accepts a question without correctness", () => {
    expect(
      quizQuestionSchema.safeParse({
        id,
        text: "Q",
        options: [{ id, text: "A" }],
      }).success,
    ).toBe(true);
  });

  it.each(["is_correct", "isCorrect"])("rejects an option with %s", (key) => {
    expect(
      quizQuestionSchema.safeParse({
        id,
        text: "Q",
        options: [{ id, text: "A", [key]: true }],
      }).success,
    ).toBe(false);
  });

  it("rejects an explanation on the question payload", () => {
    expect(
      quizPayloadSchema.safeParse({
        attemptId: id,
        questions: [{ id, text: "Q", options: [], explanation: "x" }],
      }).success,
    ).toBe(false);
  });
});

describe("allAnswered", () => {
  const qs = [{ id: "a" }, { id: "b" }];
  it("needs every question answered", () => {
    expect(allAnswered(qs, { a: "1" })).toBe(false);
    expect(allAnswered(qs, { a: "1", b: "2" })).toBe(true);
    expect(allAnswered([], {})).toBe(false);
  });
});

describe("mapQuizError", () => {
  it("maps database messages", () => {
    expect(mapQuizError("lessons_incomplete")).toBe("lessonsIncomplete");
    expect(mapQuizError("boom")).toBe("generic");
  });
});
