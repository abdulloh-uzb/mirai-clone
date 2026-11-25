import { z } from "zod";

// Shared by the server action, the sendBeacon route and the lesson timer.

export const progressInputSchema = z.object({
  enrollmentId: z.uuid(),
  lessonId: z.uuid(),
  seconds: z.number().int().min(0).max(600),
  blockPosition: z.number().int().min(0).max(1000),
});
export type ProgressInput = z.infer<typeof progressInputSchema>;

export const completeInputSchema = z.object({
  enrollmentId: z.uuid(),
  lessonId: z.uuid(),
});

export type ProgressErrorKey =
  | "enrollmentExpired"
  | "enrollmentNotActive"
  | "detailsRequired"
  | "lessonLocked"
  | "minTimeNotMet"
  | "generic";

const DB_ERRORS: { match: string; key: ProgressErrorKey }[] = [
  { match: "enrollment_expired", key: "enrollmentExpired" },
  { match: "enrollment_not_active", key: "enrollmentNotActive" },
  { match: "details_required", key: "detailsRequired" },
  { match: "lesson_locked", key: "lessonLocked" },
  { match: "min_time_not_met", key: "minTimeNotMet" },
];

/** Maps a database error message from the progress RPCs to a translation key. */
export function mapProgressError(message: string): ProgressErrorKey {
  return DB_ERRORS.find((e) => message.includes(e.match))?.key ?? "generic";
}
