import { z } from "zod";
import { quizQuestionSchema } from "@/lib/course/quiz";

// Exam RPC shapes. The question schema is the strict quiz one: a correctness
// field in the payload would fail parsing instead of reaching the browser.

export const examPayloadSchema = z.strictObject({
  attemptId: z.uuid(),
  attemptNo: z.number().int(),
  expiresAt: z.string(),
  answers: z.record(z.string(), z.string()),
  questions: z.array(quizQuestionSchema),
});
export type ExamPayload = z.infer<typeof examPayloadSchema>;

export const examResultSchema = z.object({
  score: z.number().int(),
  total: z.number().int(),
  passed: z.boolean(),
  attemptsLeft: z.number().int(),
});
export type ExamResult = z.infer<typeof examResultSchema>;

export const examEligibilitySchema = z.object({
  eligible: z.boolean(),
  reasons: z.array(z.string()),
  attemptsUsed: z.number().int(),
  attemptsAllowed: z.number().int(),
  minutesSpent: z.number().int(),
  minutesRequired: z.number().int(),
  passed: z.boolean(),
  activeAttemptId: z.uuid().nullable(),
  latest: z
    .object({
      attemptId: z.uuid(),
      attemptNo: z.number().int(),
      score: z.number().int().nullable(),
      total: z.number().int(),
      passed: z.boolean().nullable(),
    })
    .nullable(),
});
export type ExamEligibility = z.infer<typeof examEligibilitySchema>;

export const examReviewSchema = z.object({
  score: z.number().int(),
  total: z.number().int(),
  questions: z.array(
    z.object({
      id: z.uuid(),
      text: z.string(),
      explanation: z.string(),
      chosenOptionId: z.string().nullable(),
      options: z.array(
        z.object({ id: z.uuid(), text: z.string(), correct: z.boolean() }),
      ),
    }),
  ),
});
export type ExamReview = z.infer<typeof examReviewSchema>;

export const examIdSchema = z.object({ enrollmentId: z.uuid() });
export const saveExamAnswerSchema = z.object({
  attemptId: z.uuid(),
  questionId: z.uuid(),
  optionId: z.uuid(),
});
export const submitExamSchema = z.object({
  attemptId: z.uuid(),
  answers: z.record(z.uuid(), z.uuid()).optional(),
});
export const attemptIdSchema = z.object({ attemptId: z.uuid() });

export type ExamErrorKey =
  | "sectionsIncomplete"
  | "minTime"
  | "detailsRequired"
  | "noAttemptsLeft"
  | "alreadyPassed"
  | "notActive"
  | "examExpired"
  | "alreadySubmitted"
  | "noQuestions"
  | "rateLimited"
  | "generic";

const DB_ERRORS: { match: string; key: ExamErrorKey }[] = [
  { match: "sections_incomplete", key: "sectionsIncomplete" },
  { match: "min_time", key: "minTime" },
  { match: "details_required", key: "detailsRequired" },
  { match: "no_attempts_left", key: "noAttemptsLeft" },
  { match: "already_passed", key: "alreadyPassed" },
  { match: "enrollment_not_active", key: "notActive" },
  { match: "enrollment_expired", key: "notActive" },
  { match: "not_active", key: "notActive" },
  { match: "exam_expired", key: "examExpired" },
  { match: "already_submitted", key: "alreadySubmitted" },
  { match: "no_questions", key: "noQuestions" },
];

export function mapExamError(message: string): ExamErrorKey {
  return DB_ERRORS.find((e) => message.includes(e.match))?.key ?? "generic";
}

/** "MM:SS" (or "H:MM:SS") for a countdown; never negative. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/** True for /portal/exam and below, with or without a locale prefix. */
export function isExamPath(pathname: string): boolean {
  return /^(\/(en|ja|es|ru))?\/portal\/exam(\/|$)/.test(pathname);
}

export function unansweredCount(
  questions: { id: string }[],
  answers: Record<string, string | undefined>,
): number {
  return questions.filter((q) => !answers[q.id]).length;
}
