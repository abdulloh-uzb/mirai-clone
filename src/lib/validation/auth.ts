import { z } from "zod";
import { routing } from "@/i18n/routing";

// Shared by the auth forms (client) and the auth server actions (server).
// Error messages are keys under `Auth.errors` in the message files, so each
// side translates them into the UI language.

/**
 * Every key under `Auth.errors`. The `field` keys are what the Zod schemas
 * report on one field; the `form` keys are what a server action reports for
 * the whole form. All three key types derive from this one list.
 */
export const AUTH_ERROR_KEYS = [
  { kind: "field", key: "firstNameRequired" },
  { kind: "field", key: "lastNameRequired" },
  { kind: "field", key: "nameTooLong" },
  { kind: "field", key: "emailInvalid" },
  { kind: "field", key: "passwordRequired" },
  { kind: "field", key: "passwordTooShort" },
  { kind: "field", key: "passwordTooLong" },
  { kind: "field", key: "passwordsDoNotMatch" },
  { kind: "field", key: "localeInvalid" },
  { kind: "form", key: "invalidCredentials" },
  { kind: "form", key: "emailTaken" },
  { kind: "form", key: "rateLimited" },
  { kind: "form", key: "generic" },
] as const;

type AuthErrorEntry = (typeof AUTH_ERROR_KEYS)[number];

/** Any auth error message key. */
export type AuthMessageKey = AuthErrorEntry["key"];
/** Errors the Zod schemas report on one field. */
export type AuthErrorKey = Extract<AuthErrorEntry, { kind: "field" }>["key"];
/** Errors a server action reports for the whole form. */
export type AuthFormErrorKey = Extract<AuthErrorEntry, { kind: "form" }>["key"];

export function isAuthMessageKey(value: string): value is AuthMessageKey {
  return AUTH_ERROR_KEYS.some((entry) => entry.key === value);
}

/** The UI language an auth action runs in. Anything unknown falls back to English. */
export const localeSchema = z
  .enum(routing.locales)
  .catch(routing.defaultLocale);

const message = (key: AuthErrorKey) => ({ error: key });

export const PASSWORD_MIN_LENGTH = 8;
// bcrypt, which Supabase Auth uses, ignores everything after 72 bytes.
export const PASSWORD_MAX_LENGTH = 72;
const NAME_MAX_LENGTH = 50;

const name = (requiredKey: AuthErrorKey) =>
  z
    .string(message(requiredKey))
    .trim()
    .min(1, message(requiredKey))
    .max(NAME_MAX_LENGTH, message("nameTooLong"));

export const emailField = z
  .string(message("emailInvalid"))
  .trim()
  .toLowerCase()
  .pipe(z.email(message("emailInvalid")));

const newPassword = z
  .string(message("passwordTooShort"))
  .min(PASSWORD_MIN_LENGTH, message("passwordTooShort"))
  .max(PASSWORD_MAX_LENGTH, message("passwordTooLong"));

export const signUpSchema = z.object({
  firstName: name("firstNameRequired"),
  lastName: name("lastNameRequired"),
  email: emailField,
  password: newPassword,
  preferredLocale: z.enum(routing.locales, message("localeInvalid")),
});
export type SignUpInput = z.input<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailField,
  password: z
    .string(message("passwordRequired"))
    .min(1, message("passwordRequired")),
});
export type SignInInput = z.input<typeof signInSchema>;

/** Magic link and password reset requests. */
export const emailOnlySchema = z.object({ email: emailField });
export type EmailOnlyInput = z.input<typeof emailOnlySchema>;

export const newPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(message("passwordsDoNotMatch")),
  })
  .refine((value) => value.password === value.confirmPassword, {
    ...message("passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });
export type NewPasswordInput = z.input<typeof newPasswordSchema>;
