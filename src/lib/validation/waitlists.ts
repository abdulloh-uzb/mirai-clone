import { z } from "zod";
import { emailField } from "@/lib/validation/auth";
import type { FieldErrorKey } from "@/lib/validation/support";

// Shared by the waitlist forms (client) and their server actions (server).

const message = (key: FieldErrorKey) => ({ error: key });

export const stateWaitlistSchema = z.object({
  email: emailField,
  stateCode: z
    .string(message("stateInvalid"))
    .regex(/^[A-Z]{2}$/, message("stateInvalid")),
});
export type StateWaitlistInput = z.input<typeof stateWaitlistSchema>;

export const classroomWaitlistSchema = z.object({
  email: emailField,
  countySlug: z
    .string(message("countyInvalid"))
    .trim()
    .min(1, message("countyInvalid"))
    .max(100, message("countyInvalid")),
});
export type ClassroomWaitlistInput = z.input<typeof classroomWaitlistSchema>;
