import { z } from "zod";
import { emailField } from "@/lib/validation/auth";

// Shared by the public forms (client) and their server actions (server).
// Error messages are keys under `Forms.errors` in the message files.

/** Every key under `Forms.errors`, split like `AUTH_ERROR_KEYS`. */
export const FORM_ERROR_KEYS = [
  { kind: "field", key: "nameRequired" },
  { kind: "field", key: "nameTooLong" },
  { kind: "field", key: "emailInvalid" },
  { kind: "field", key: "topicInvalid" },
  { kind: "field", key: "messageTooShort" },
  { kind: "field", key: "messageTooLong" },
  { kind: "field", key: "phoneTooLong" },
  { kind: "field", key: "phoneRequired" },
  { kind: "field", key: "preferredContactInvalid" },
  { kind: "field", key: "pageUrlInvalid" },
  { kind: "field", key: "screenshotType" },
  { kind: "field", key: "screenshotTooLarge" },
  { kind: "form", key: "rateLimited" },
  { kind: "form", key: "generic" },
] as const;

type FormErrorEntry = (typeof FORM_ERROR_KEYS)[number];

export type FormMessageKey = FormErrorEntry["key"];
export type FieldErrorKey = Extract<FormErrorEntry, { kind: "field" }>["key"];
export type FormErrorKey = Extract<FormErrorEntry, { kind: "form" }>["key"];

export function isFormMessageKey(value: string): value is FormMessageKey {
  return FORM_ERROR_KEYS.some((entry) => entry.key === value);
}

/**
 * Name of the hidden bot-trap input. Real users never see it, so any value in
 * it means a bot: the server pretends the form succeeded and does nothing.
 */
export const HONEYPOT_FIELD = "website";

export const CONTACT_TOPICS = [
  "general",
  "course",
  "payment",
  "technical",
] as const;
export const PREFERRED_CONTACTS = ["email", "phone"] as const;

export const SCREENSHOT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export const SCREENSHOT_MAX_BYTES = 5 * 1024 * 1024;

const NAME_MAX = 100;
const TEXT_MIN = 10;
const TEXT_MAX = 5000;
const PHONE_MAX = 30;

const message = (key: FieldErrorKey) => ({ error: key });

const name = z
  .string(message("nameRequired"))
  .trim()
  .min(1, message("nameRequired"))
  .max(NAME_MAX, message("nameTooLong"));

const longText = z
  .string(message("messageTooShort"))
  .trim()
  .min(TEXT_MIN, message("messageTooShort"))
  .max(TEXT_MAX, message("messageTooLong"));

const phone = z
  .string()
  .trim()
  .max(PHONE_MAX, message("phoneTooLong"))
  .optional()
  .transform((value) => value || undefined);

export const contactSchema = z.object({
  name,
  email: emailField,
  topic: z.enum(CONTACT_TOPICS, message("topicInvalid")),
  message: longText,
});
export type ContactInput = z.input<typeof contactSchema>;

export const adaSchema = z
  .object({
    name,
    email: emailField,
    phone,
    need: longText,
    preferredContact: z.enum(
      PREFERRED_CONTACTS,
      message("preferredContactInvalid"),
    ),
  })
  .superRefine((value, ctx) => {
    if (value.preferredContact === "phone" && !value.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "phoneRequired",
      });
    }
  });
export type AdaInput = z.input<typeof adaSchema>;

export const bugReportSchema = z.object({
  whatHappened: longText,
  email: emailField,
  pageUrl: z
    .string(message("pageUrlInvalid"))
    .trim()
    .max(2048, message("pageUrlInvalid")),
});
export type BugReportInput = z.input<typeof bugReportSchema>;

/** The screenshot key an uploaded file fails with, or null when it is fine. */
export function screenshotError(file: {
  type: string;
  size: number;
}): Extract<FieldErrorKey, "screenshotType" | "screenshotTooLarge"> | null {
  if (!(SCREENSHOT_TYPES as readonly string[]).includes(file.type)) {
    return "screenshotType";
  }
  if (file.size > SCREENSHOT_MAX_BYTES) return "screenshotTooLarge";
  return null;
}

/** An optional uploaded file (server side) checked with `screenshotError`. */
export const screenshotSchema = z
  .custom<File>((value) => value instanceof File, message("screenshotType"))
  .superRefine((file, ctx) => {
    const key = screenshotError(file);
    if (key) ctx.addIssue({ code: "custom", message: key });
  })
  .optional();
