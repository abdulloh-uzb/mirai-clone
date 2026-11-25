"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { hasLocale } from "next-intl";
import type { z } from "zod";
import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  emailOnlySchema,
  newPasswordSchema,
  signInSchema,
  signUpSchema,
  type AuthErrorKey,
} from "@/lib/validation/auth";
import { getPathname, redirect } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

// All auth mutations run here, on the server. Inputs are re-validated with the
// same Zod schemas the forms use.
//
// TODO(spec): auth emails use Supabase's built-in English templates. Translate
// them into the four UI languages when email moves to Resend.

export type AuthFormErrorKey =
  "invalidCredentials" | "emailTaken" | "rateLimited" | "generic";

export type AuthActionResult =
  | {
      status: "error";
      formError?: AuthFormErrorKey;
      fieldErrors?: Record<string, AuthErrorKey>;
    }
  | { status: "sent" };

type Supabase = SupabaseClient<Database>;

function toLocale(value: unknown): Locale {
  return typeof value === "string" && hasLocale(routing.locales, value)
    ? value
    : routing.defaultLocale;
}

function fieldErrorsOf(error: z.ZodError): AuthActionResult {
  const fieldErrors: Record<string, AuthErrorKey> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] ??= issue.message as AuthErrorKey;
  }
  return { status: "error", fieldErrors };
}

/** Where an email link lands: our callback, which then sends the user to `next`. */
function callbackUrl(next: string): string {
  const url = new URL("/api/auth/callback", publicEnv.NEXT_PUBLIC_SITE_URL);
  url.searchParams.set("next", next);
  return url.toString();
}

const homePath = (locale: Locale) => getPathname({ href: "/", locale });

/**
 * Sends the "verify your email" link. Any successful email-link sign-in proves
 * the address, and the callback route records that on the profile.
 * TODO(spec): local Supabase cannot allow unverified password sign-in, so email
 * confirmations are off and verification is tracked in `profiles.email_verified_at`
 * (see 00-coordination). Revisit with hosted Supabase and Resend.
 */
async function sendVerificationEmail(
  supabase: Supabase,
  email: string,
  locale: Locale,
) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: callbackUrl(homePath(locale)),
    },
  });
}

export async function signUp(
  input: unknown,
  localeInput: unknown,
): Promise<AuthActionResult> {
  const locale = toLocale(localeInput);
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error);
  const { email, password, firstName, lastName, preferredLocale } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // The sign-up trigger copies these to the profile. It never reads a role.
      data: {
        first_name: firstName,
        last_name: lastName,
        preferred_locale: preferredLocale,
      },
    },
  });
  if (error) {
    if (error.code === "user_already_exists" || error.code === "email_exists") {
      return { status: "error", formError: "emailTaken" };
    }
    if (error.code === "weak_password") {
      return { status: "error", fieldErrors: { password: "passwordTooShort" } };
    }
    if (error.status === 429)
      return { status: "error", formError: "rateLimited" };
    return { status: "error", formError: "generic" };
  }

  // The account exists and is signed in even if this email fails; the banner
  // offers a resend.
  await sendVerificationEmail(supabase, email, locale);
  redirect({ href: "/", locale });
  return { status: "sent" };
}

export async function signIn(
  input: unknown,
  localeInput: unknown,
): Promise<AuthActionResult> {
  const locale = toLocale(localeInput);
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    // One generic message for every failure, so nobody can learn which emails
    // are registered.
    return { status: "error", formError: "invalidCredentials" };
  }
  redirect({ href: "/", locale });
  return { status: "sent" };
}

export async function sendMagicLink(
  input: unknown,
  localeInput: unknown,
): Promise<AuthActionResult> {
  const locale = toLocale(localeInput);
  const parsed = emailOnlySchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: callbackUrl(homePath(locale)),
    },
  });
  if (error?.status === 429)
    return { status: "error", formError: "rateLimited" };
  // Unknown emails get the same answer as known ones.
  return { status: "sent" };
}

export async function requestPasswordReset(
  input: unknown,
  localeInput: unknown,
): Promise<AuthActionResult> {
  const locale = toLocale(localeInput);
  const parsed = emailOnlySchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: callbackUrl(
        getPathname({ href: "/reset-password/update", locale }),
      ),
    },
  );
  if (error?.status === 429)
    return { status: "error", formError: "rateLimited" };
  return { status: "sent" };
}

export async function updatePassword(
  input: unknown,
  localeInput: unknown,
): Promise<AuthActionResult> {
  const locale = toLocale(localeInput);
  const parsed = newPasswordSchema.safeParse(input);
  if (!parsed.success) return fieldErrorsOf(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    if (error.code === "weak_password") {
      return { status: "error", fieldErrors: { password: "passwordTooShort" } };
    }
    return { status: "error", formError: "generic" };
  }
  redirect({ href: "/", locale });
  return { status: "sent" };
}

export async function resendVerificationEmail(
  localeInput: unknown,
): Promise<AuthActionResult> {
  const locale = toLocale(localeInput);
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email;
  if (typeof email !== "string" || !email) {
    return { status: "error", formError: "generic" };
  }
  const { error } = await sendVerificationEmail(supabase, email, locale);
  if (error?.status === 429)
    return { status: "error", formError: "rateLimited" };
  if (error) return { status: "error", formError: "generic" };
  return { status: "sent" };
}

export async function signOut(localeInput: unknown): Promise<void> {
  const locale = toLocale(localeInput);
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/", locale });
}
