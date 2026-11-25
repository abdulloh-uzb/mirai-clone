"use server";

import { revalidatePath } from "next/cache";
import {
  completeLessonRpc,
  recordTime,
  type ProgressResult,
} from "@/lib/portal/progress";
import {
  completeInputSchema,
  progressInputSchema,
} from "@/lib/validation/progress";

/** Heartbeat from the lesson timer. The database caps what it credits. */
export async function recordLessonTime(
  input: unknown,
): Promise<ProgressResult> {
  const parsed = progressInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  return recordTime(parsed.data);
}

/** Marks the lesson complete once the database agrees the minimum time is met. */
export async function completeLesson(input: unknown): Promise<ProgressResult> {
  const parsed = completeInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "generic" };
  const result = await completeLessonRpc(
    parsed.data.enrollmentId,
    parsed.data.lessonId,
  );
  if (result.ok) revalidatePath("/", "layout");
  return result;
}
