import { describe, expect, it } from "vitest";
import { parseQuestionForm } from "./question-form";

function form(over: Record<string, string> = {}) {
  const f = new FormData();
  const base: Record<string, string> = {
    locale: "en",
    text: "Q?",
    explanation: "",
    option0: "a",
    option1: "b",
    option2: "c",
    option3: "d",
    correct: "2",
    ...over,
  };
  for (const [k, v] of Object.entries(base)) f.set(k, v);
  return f;
}

describe("parseQuestionForm", () => {
  it("accepts four options with one correct", () => {
    const r = parseQuestionForm(form());
    expect(r.success && r.data.correct).toBe(2);
  });
  it("rejects a missing correct choice or out-of-range one", () => {
    expect(parseQuestionForm(form({ correct: "" })).success).toBe(false);
    expect(parseQuestionForm(form({ correct: "4" })).success).toBe(false);
  });
  it("rejects an empty option", () => {
    expect(parseQuestionForm(form({ option1: " " })).success).toBe(false);
  });
});
