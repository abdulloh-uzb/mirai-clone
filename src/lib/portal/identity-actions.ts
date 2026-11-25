"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const answerSchema = z.object({
  enrollmentId: z.uuid(),
  questionKey: z.enum(["dob", "license_no_last4", "security_question"]),
  answer: z.string().trim().min(1).max(200),
});

export type IdentityAnswerResult =
  { ok: true; correct: boolean; paused: boolean } | { ok: false };

export async function answerIdentityCheck(
  input: unknown,
): Promise<IdentityAnswerResult> {
  const parsed = answerSchema.safeParse(input);
  if (!parsed.success) return { ok: false };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("answer_identity_check", {
    p_enrollment_id: parsed.data.enrollmentId,
    p_question_key: parsed.data.questionKey,
    p_answer: parsed.data.answer,
  });
  if (error) return { ok: false };
  const result = z
    .object({ correct: z.boolean(), paused: z.boolean() })
    .safeParse(data);
  if (!result.success) return { ok: false };
  revalidatePath("/", "layout");
  return { ok: true, ...result.data };
}
