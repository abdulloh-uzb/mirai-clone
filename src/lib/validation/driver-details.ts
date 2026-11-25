import { z } from "zod";
import type { FieldErrorKey } from "@/lib/validation/support";

// Shared by the details form (client) and its server action. Mirrors the DB
// rules in the `driver_details` migration. Error messages are keys under
// `Forms.errors`.

export const SECURITY_QUESTION_KEYS = [
  "first_car",
  "birth_city",
  "first_school",
  "favorite_teacher",
  "childhood_street",
] as const;

const PLACEHOLDER_DOBS = ["1900-01-01", "1900-02-02"];
const MIN_AGE = 15;
const MAX_AGE = 100;

const message = (key: FieldErrorKey) => ({ error: key });
const fail = (key: FieldErrorKey) => ({ message: key });

/** Whole years between a `YYYY-MM-DD` date and `now` (UTC calendar date). */
function ageOn(dob: string, now: Date): number {
  const [y, m, d] = dob.split("-").map(Number);
  let age = now.getUTCFullYear() - y!;
  if (
    now.getUTCMonth() + 1 < m! ||
    (now.getUTCMonth() + 1 === m! && now.getUTCDate() < d!)
  ) {
    age -= 1;
  }
  return age;
}

const isoDate = (key: FieldErrorKey) =>
  z
    .string(message(key))
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, fail(key))
    .refine(
      (value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)),
      fail(key),
    );

export function makeDriverDetailsSchema(options?: {
  now?: Date;
  requireSecurityAnswer?: boolean;
}) {
  const now = options?.now ?? new Date();
  const today = now.toISOString().slice(0, 10);
  const requireAnswer = options?.requireSecurityAnswer ?? true;

  return z
    .object({
      legalName: z
        .string(message("legalNameRequired"))
        .trim()
        .min(1, fail("legalNameRequired"))
        .max(200, fail("legalNameRequired")),
      dob: isoDate("dobRequired")
        .refine(
          (v) => !PLACEHOLDER_DOBS.includes(v) && v >= "1901-01-01",
          fail("dobPlaceholder"),
        )
        .refine((v) => {
          const age = ageOn(v, now);
          return age >= MIN_AGE && age <= MAX_AGE;
        }, fail("dobAge")),
      licenseNo: z
        .string(message("licenseRequired"))
        .trim()
        .min(1, fail("licenseRequired"))
        .max(30, fail("licenseFormat")),
      licenseState: z
        .string(message("licenseFormat"))
        .trim()
        .toUpperCase()
        .regex(/^[A-Z]{2}$/, fail("licenseFormat")),
      phone: z
        .string(message("phoneInvalid"))
        .trim()
        .regex(/^\+?[0-9 ()-]{7,20}$/, fail("phoneInvalid")),
      countySlug: z
        .string(message("countyInvalid"))
        .min(1, fail("countyInvalid")),
      citationNo: z
        .string(message("citationRequired"))
        .trim()
        .min(1, fail("citationRequired"))
        .transform((v) => v.toUpperCase())
        .refine((v) => /^[A-Z0-9-]{1,30}$/.test(v), fail("citationFormat")),
      courtDueDate: isoDate("dueDateRequired").refine(
        (v) => v >= today,
        fail("dueDatePast"),
      ),
      securityQuestion: z.enum(
        SECURITY_QUESTION_KEYS,
        message("securityQuestionInvalid"),
      ),
      securityAnswer: z.string().trim().default(""),
    })
    .superRefine((value, ctx) => {
      if (
        value.licenseState === "CA" &&
        !/^[A-Z][0-9]{7}$/.test(value.licenseNo)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["licenseNo"],
          message: "licenseFormat",
        });
      }
      const answer = value.securityAnswer;
      if ((requireAnswer || answer !== "") && answer.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["securityAnswer"],
          message: "securityAnswerShort",
        });
      }
    });
}

export type DriverDetailsInput = z.input<
  ReturnType<typeof makeDriverDetailsSchema>
>;
export type DriverDetails = z.output<
  ReturnType<typeof makeDriverDetailsSchema>
>;
