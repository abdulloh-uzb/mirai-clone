import { z } from "zod";
import { Constants, type Enums } from "@/lib/database.types";

export type StudentStage = Enums<"student_stage">;

/** In funnel order, as declared in the `student_stage` Postgres enum. */
export const STUDENT_STAGES = Constants.public.Enums.student_stage;

export const studentStageSchema = z.enum(STUDENT_STAGES);

/** `?stage=` from the URL, or undefined when missing or unknown. */
export function parseStageParam(value: unknown): StudentStage | undefined {
  const r = studentStageSchema.safeParse(value);
  return r.success ? r.data : undefined;
}
