# 0001: Email verification without Supabase's email confirmation

**Status:** accepted (2026-11-25, phase 1)

## Context

Spec story 27 needs an unverified Student to be able to sign in, see a "Verify your email" banner and resend the email. Local Supabase can't let an unverified user sign in with a password while email confirmation is on.

## Decision

- `supabase/config.toml` turns email confirmation off.
- The app tracks verification itself in `profiles.email_verified_at`. Only the service role sets it, in `src/app/api/auth/callback/route.ts`, and a guard trigger stops clients from changing it.
- The verification email is a `signInWithOtp({ shouldCreateUser: false })` link, so any successful email-link sign-in counts as verified.
- Auth emails use Supabase's English templates, so the verification email's subject is "Magic Link". Translating them is a `TODO(spec)`.

## Consequences

- Email links use PKCE, so they work only in the browser that requested them.
- Code that needs "verified" reads `profiles.email_verified_at`, not `auth.users.email_confirmed_at`.
- In production, check whether hosted Supabase allows unverified sign-in. If it does, revisit this ADR.
