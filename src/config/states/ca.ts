// California traffic school eligibility. Pure, so the page and the tests share it.
// This is guidance only (a demo): the Court always decides.

export const ELIGIBILITY_QUESTIONS = [
  "validLicense",
  "courtAllowed",
  "noRecentSchool",
  "nonCommercial",
  "eligibleViolation",
] as const;

export type EligibilityQuestionId = (typeof ELIGIBILITY_QUESTIONS)[number];
/** true = "yes". */
export type EligibilityAnswers = Record<EligibilityQuestionId, boolean>;

export type EligibilityResult =
  | { status: "eligible" }
  | { status: "incomplete" }
  | {
      status: "notEligible" | "askCourt";
      blockingQuestion: EligibilityQuestionId;
    };

/**
 * What a "no" means, per question:
 *
 * | question          | "no" means  | why                                         |
 * | ----------------- | ----------- | ------------------------------------------- |
 * | validLicense      | notEligible | traffic school needs a valid license        |
 * | courtAllowed      | askCourt    | only the Court can say whether it allows it |
 * | noRecentSchool    | notEligible | a recent school completion blocks a new one |
 * | nonCommercial     | notEligible | commercial licenses are not eligible        |
 * | eligibleViolation | askCourt    | the Court decides which violations qualify  |
 */
const BLOCKING_STATUS: Record<
  EligibilityQuestionId,
  "notEligible" | "askCourt"
> = {
  validLicense: "notEligible",
  courtAllowed: "askCourt",
  noRecentSchool: "notEligible",
  nonCommercial: "notEligible",
  eligibleViolation: "askCourt",
};

/** The first "no" in question order blocks; all "yes" is eligible. */
export function eligibilityResult(
  answers: Partial<EligibilityAnswers>,
): EligibilityResult {
  for (const question of ELIGIBILITY_QUESTIONS) {
    if (answers[question] === false) {
      return {
        status: BLOCKING_STATUS[question],
        blockingQuestion: question,
      };
    }
  }
  return ELIGIBILITY_QUESTIONS.every((q) => answers[q] === true)
    ? { status: "eligible" }
    : { status: "incomplete" };
}
