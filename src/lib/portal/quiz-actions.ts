"use server";

import { revalidatePath } from "next/cache";
import {
  mapQuizError,
  quizPayloadSchema,
  quizResultSchema,
  startQuizInputSchema,
  submitQuizInputSchema,
  type QuizErrorKey,
  type QuizPayload,
  type QuizResult,
} from "@/lib/course/quiz";
import { createClient } from "@/lib/supabase/server";

export type StartQuizResult =
  { ok: true; quiz: QuizPayload } | { ok: false; error: QuizErrorKey };
export type SubmitQuizResult =
  { ok: true; result: QuizResult } | { ok: false; error: QuizErrorKey };

/** Starts (or resumes) a section quiz. Correct answers are never in the output. */
export async function startQuiz(input: unknown): Promise<StartQuizResult> {
  const parsed = startQuizInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_quiz", {
    p_enrollment_id: parsed.data.enrollmentId,
    p_section_position: parsed.data.section,
  });
  if (error) return { ok: false, error: mapQuizError(error.message) };
  const quiz = quizPayloadSchema.safeParse(data);
  if (!quiz.success) return { ok: false, error: "generic" };
  return { ok: true, quiz: quiz.data };
}

/** Grades the attempt in the database and returns the results with explanations. */
export async function submitQuiz(input: unknown): Promise<SubmitQuizResult> {
  const parsed = submitQuizInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_quiz", {
    p_attempt_id: parsed.data.attemptId,
    p_answers: parsed.data.answers,
  });
  if (error) return { ok: false, error: mapQuizError(error.message) };
  const result = quizResultSchema.safeParse(data);
  if (!result.success) return { ok: false, error: "generic" };
  revalidatePath("/", "layout");
  return { ok: true, result: result.data };
}
