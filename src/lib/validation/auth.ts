import { z } from "zod";
import { routing } from "@/i18n/routing";

// Shared by the auth forms (client) and the auth server actions (server).
// Error messages are keys under `Auth.errors` in the message files, so each
// side translates them into the UI language.

export type AuthErrorKey =
  | "firstNameRequired"
  | "lastNameRequired"
  | "nameTooLong"
  | "emailInvalid"
  | "passwordRequired"
  | "passwordTooShort"
  | "passwordTooLong"
  | "passwordsDoNotMatch"
  | "localeInvalid";

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
