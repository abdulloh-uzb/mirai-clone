import { describe, expect, it } from "vitest";
import {
  ELIGIBILITY_QUESTIONS,
  eligibilityResult,
  type EligibilityAnswers,
} from "./ca";

const allYes = Object.fromEntries(
  ELIGIBILITY_QUESTIONS.map((q) => [q, true]),
) as EligibilityAnswers;

describe("eligibilityResult", () => {
  it("is eligible when every answer is yes", () => {
    expect(eligibilityResult(allYes)).toEqual({ status: "eligible" });
  });

  it.each([
    ["validLicense", "notEligible"],
    ["courtAllowed", "askCourt"],
    ["noRecentSchool", "notEligible"],
    ["nonCommercial", "notEligible"],
    ["eligibleViolation", "askCourt"],
  ] as const)("blocks on a single no to %s", (question, status) => {
    expect(eligibilityResult({ ...allYes, [question]: false })).toEqual({
      status,
      blockingQuestion: question,
    });
  });

  it("reports the first no in question order", () => {
    expect(
      eligibilityResult({
        ...allYes,
        eligibleViolation: false,
        courtAllowed: false,
      }),
    ).toEqual({ status: "askCourt", blockingQuestion: "courtAllowed" });
  });

  it("is incomplete while a question is unanswered", () => {
    expect(eligibilityResult({})).toEqual({ status: "incomplete" });
    expect(eligibilityResult({ ...allYes, nonCommercial: undefined })).toEqual({
      status: "incomplete",
    });
  });
});
