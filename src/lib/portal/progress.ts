import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  mapProgressError,
  type ProgressErrorKey,
  type ProgressInput,
} from "@/lib/validation/progress";

export type ProgressResult =
  { ok: true; secondsSpent?: number } | { ok: false; error: ProgressErrorKey };

/** Flips an overdue enrollment to expired (a raise inside the RPC rolls that back). */
async function markExpiredIfDue(enrollmentId: string) {
  const supabase = await createClient();
  await supabase.rpc("expire_enrollment_if_due", {
    p_enrollment_id: enrollmentId,
  });
}

export async function recordTime(
  input: ProgressInput,
): Promise<ProgressResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_lesson_time", {
    p_enrollment_id: input.enrollmentId,
    p_lesson_id: input.lessonId,
    p_seconds: input.seconds,
    p_block_position: input.blockPosition,
  });
  if (error) {
    const key = mapProgressError(error.message);
    if (key === "enrollmentExpired") await markExpiredIfDue(input.enrollmentId);
    return { ok: false, error: key };
  }
  return { ok: true, secondsSpent: data };
}

export async function completeLessonRpc(
  enrollmentId: string,
  lessonId: string,
): Promise<ProgressResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_lesson", {
    p_enrollment_id: enrollmentId,
    p_lesson_id: lessonId,
  });
  if (error) {
    const key = mapProgressError(error.message);
    if (key === "enrollmentExpired") await markExpiredIfDue(enrollmentId);
    return { ok: false, error: key };
  }
  return { ok: true };
}
