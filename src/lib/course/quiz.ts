import { z } from "zod";

// Shapes of the quiz RPC output. The question schema is strict: if the
// database ever returned a correctness field it would fail here instead of
// reaching the browser.

export const quizQuestionSchema = z.strictObject({
  id: z.uuid(),
  text: z.string(),
  options: z.array(z.strictObject({ id: z.uuid(), text: z.string() })),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizPayloadSchema = z.strictObject({
  attemptId: z.uuid(),
  questions: z.array(quizQuestionSchema),
});
export type QuizPayload = z.infer<typeof quizPayloadSchema>;

export const quizResultSchema = z.object({
  score: z.number().int(),
  total: z.number().int(),
  passed: z.boolean(),
  results: z.array(
    z.object({
      questionId: z.uuid(),
      chosenOptionId: z.uuid().nullable(),
      correctOptionId: z.uuid().nullable(),
      correct: z.boolean(),
      explanation: z.string(),
    }),
  ),
});
export type QuizResult = z.infer<typeof quizResultSchema>;

export const startQuizInputSchema = z.object({
  enrollmentId: z.uuid(),
  section: z.number().int().min(1).max(50),
});

export const submitQuizInputSchema = z.object({
  attemptId: z.uuid(),
  answers: z.record(z.uuid(), z.uuid()),
});

export type QuizErrorKey =
  | "enrollmentExpired"
  | "enrollmentNotActive"
  | "detailsRequired"
  | "lessonsIncomplete"
  | "sectionLocked"
  | "noQuestions"
  | "identityCheckRequired"
  | "alreadySubmitted"
  | "generic";

const DB_ERRORS: { match: string; key: QuizErrorKey }[] = [
  { match: "enrollment_expired", key: "enrollmentExpired" },
  { match: "enrollment_not_active", key: "enrollmentNotActive" },
  { match: "details_required", key: "detailsRequired" },
  { match: "lessons_incomplete", key: "lessonsIncomplete" },
  { match: "section_locked", key: "sectionLocked" },
  { match: "no_questions", key: "noQuestions" },
  { match: "identity_check_required", key: "identityCheckRequired" },
  { match: "already_submitted", key: "alreadySubmitted" },
];

export function mapQuizError(message: string): QuizErrorKey {
  return DB_ERRORS.find((e) => message.includes(e.match))?.key ?? "generic";
}

export function allAnswered(
  questions: Pick<QuizQuestion, "id">[],
  answers: Record<string, string | undefined>,
): boolean {
  return questions.length > 0 && questions.every((q) => !!answers[q.id]);
}
