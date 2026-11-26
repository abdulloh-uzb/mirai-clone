"use server";

import { revalidatePath } from "next/cache";
import {
  attemptIdSchema,
  examEligibilitySchema,
  examIdSchema,
  examPayloadSchema,
  examResultSchema,
  examReviewSchema,
  mapExamError,
  saveExamAnswerSchema,
  submitExamSchema,
  type ExamEligibility,
  type ExamErrorKey,
  type ExamPayload,
  type ExamResult,
  type ExamReview,
} from "@/lib/exam/exam";
import { issueCertificateFor } from "@/lib/certificates/issue";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

type Fail = { ok: false; error: ExamErrorKey };

async function rateLimited(
  userId: string,
  action: string,
  max: number,
): Promise<boolean> {
  const { data, error } = await createServiceClient().rpc("hit_rate_limit", {
    key: `exam:${action}:user:${userId}`,
    max,
    window_seconds: 600,
  });
  return !!error || !data;
}

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

export async function getExamEligibility(
  input: unknown,
): Promise<{ ok: true; eligibility: ExamEligibility } | Fail> {
  const parsed = examIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("exam_eligibility", {
    p_enrollment_id: parsed.data.enrollmentId,
  });
  if (error) return { ok: false, error: mapExamError(error.message) };
  const e = examEligibilitySchema.safeParse(data);
  return e.success
    ? { ok: true, eligibility: e.data }
    : { ok: false, error: "generic" };
}

/** Starts or resumes the exam. Correct answers are never in the output. */
export async function startExam(
  input: unknown,
): Promise<
  | { ok: true; exam: ExamPayload }
  | { ok: true; exam: null; finished: ExamResult }
  | Fail
> {
  const parsed = examIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "generic" };
  if (await rateLimited(userId, "start", 20)) {
    return { ok: false, error: "rateLimited" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_exam", {
    p_enrollment_id: parsed.data.enrollmentId,
  });
  if (error) return { ok: false, error: mapExamError(error.message) };
  const exam = examPayloadSchema.safeParse(data);
  if (exam.success) {
    revalidatePath("/", "layout");
    return { ok: true, exam: exam.data };
  }
  // Time ran out on an earlier attempt and that ended the course.
  const finished = examResultSchema.safeParse(data);
  if (finished.success) {
    revalidatePath("/", "layout");
    return { ok: true, exam: null, finished: finished.data };
  }
  return { ok: false, error: "generic" };
}

export async function saveExamAnswer(
  input: unknown,
): Promise<{ ok: true } | Fail> {
  const parsed = saveExamAnswerSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_exam_answer", {
    p_attempt_id: parsed.data.attemptId,
    p_question_id: parsed.data.questionId,
    p_option_id: parsed.data.optionId,
  });
  return error
    ? { ok: false, error: mapExamError(error.message) }
    : { ok: true };
}

export async function submitExam(
  input: unknown,
): Promise<{ ok: true; result: ExamResult } | Fail> {
  const parsed = submitExamSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "generic" };
  if (await rateLimited(userId, "submit", 10)) {
    return { ok: false, error: "rateLimited" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_exam", {
    p_attempt_id: parsed.data.attemptId,
    p_answers: parsed.data.answers,
  });
  if (error) return { ok: false, error: mapExamError(error.message) };
  const result = examResultSchema.safeParse(data);
  if (!result.success) return { ok: false, error: "generic" };
  if (result.data.passed) {
    // The student passed; a failure here is retried from /portal/certificates.
    const { data: attempt } = await supabase
      .from("exam_attempts")
      .select("enrollment_id")
      .eq("id", parsed.data.attemptId)
      .single();
    if (attempt) {
      await issueCertificateFor(attempt.enrollment_id).catch((e) =>
        console.error("certificate issue failed", e),
      );
    }
  }
  revalidatePath("/", "layout");
  return { ok: true, result: result.data };
}

/** Per-question review. The database allows it only for a passed attempt. */
export async function getExamReview(
  input: unknown,
): Promise<{ ok: true; review: ExamReview } | Fail> {
  const parsed = attemptIdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("exam_review", {
    p_attempt_id: parsed.data.attemptId,
  });
  if (error) return { ok: false, error: mapExamError(error.message) };
  const review = examReviewSchema.safeParse(data);
  return review.success
    ? { ok: true, review: review.data }
    : { ok: false, error: "generic" };
}
