# Plan 02: Driver/court details, validation and lock

**Goal:** `.scratch/lms/issues/02-driver-details.md` (spec §6 "Driver/court details" and `/portal/profile`). Read `.scratch/lms/spec.md` first.

Enrollments don't exist yet in the app (ticket 06 creates them via the webhook). Tests create enrollments with the service client (`tests/support/users.ts`, `tests/support/supabase.ts`).

## Data — migration `driver_details`

- `enrollments.county_id uuid references public.counties(id) on delete restrict` (the Student picks a County; `court_id` stays unused, `TODO(spec)`: courthouse pick).
- Security question: reuse `security_questions` (one row per user; add `unique (user_id)`). Question is a key from a fixed list (`first_car`, `birth_city`, `first_school`, `favorite_teacher`, `childhood_street`) — add `check (question in (...))`. `answer_hash` = `extensions.crypt(lower(trim(answer)), extensions.gen_salt('bf'))` (pgcrypto is in the `extensions` schema on Supabase; `create extension if not exists pgcrypto with schema extensions`).
- Trigger `profiles_validate_details` (before insert/update on profiles, all callers): when `dob` is not null → reject `1900-01-01`, `1900-02-02`, any date before 1901-01-01, and age outside 15–100 (`age(current_date, dob)`); when `license_state = 'CA'` and `license_no` not null → `license_no ~ '^[A-Z][0-9]{7}$'`; `license_state ~ '^[A-Z]{2}$'`; phone `^\+?[0-9 ()-]{7,20}$`. Raise with `errcode = '23514'` and a message naming the field.
- Extend the lock in `public.guard_profile_update()` (re-define with `create or replace` in the new migration, keep its existing behaviour): if `old.details_locked_at is not null` and `legal_name`, `dob` or `license_no` changes and the caller is `anon`/`authenticated` (Admins included — Admins must use the override function so a reason is recorded) → raise `'details are locked'` `42501`.
- `public.save_driver_details(p_enrollment_id uuid, p_legal_name text, p_dob date, p_license_no text, p_license_state text, p_phone text, p_county_id uuid, p_citation_no text, p_court_due_date date, p_security_question text, p_security_answer text)` — `security definer`, `set search_path = ''`, granted to `authenticated` only. Checks the enrollment belongs to `auth.uid()` and is `active`. Citation: upper-cased, `^[A-Z0-9-]{1,30}$`; if any courthouse of the County has `citation_regex`, it must match at least one. Court due date not in the past. Updates the profile fields (the lock trigger still applies; locked fields that are unchanged are fine) and enrollment `county_id`, `citation_no`, `court_due_date`; upserts the security question (answer optional on later saves when one exists already). Returns void; raises `23514`/`42501` with field-specific messages that the server action maps to field errors.
- `public.lock_driver_details(p_user_id uuid)` — security definer, sets `details_locked_at = now()` if null. Not granted to clients (ticket 05 calls it from inside its own exam-start function).
- `public.admin_update_locked_details(p_user_id uuid, p_legal_name text, p_dob date, p_license_no text, p_reason text)` — security definer, granted to `authenticated`; requires `public.is_admin()` and `length(trim(p_reason)) >= 5`; bypasses the lock (e.g. `set_config('app.details_override','on', true)` checked by the guard) and inserts `audit_log` (`action 'profile.details_override'`, entity `profiles`, before/after jsonb of the 3 fields + reason in after).
- `public.has_driver_details(p_enrollment_id uuid) returns boolean` (security definer, own enrollment or admin): true when legal name, dob, license, phone, county, citation and due date are all set. Ticket 03 uses it to gate section 1.
- Regenerate `src/lib/database.types.ts`.

## Files

- `src/lib/validation/driver-details.ts` (shared Zod): `driverDetailsSchema` mirrors the DB rules (dob as `YYYY-MM-DD` string; age 15–100 relative to an injectable `now`; placeholder dates rejected; CA license regex when state is CA; citation upper-cased; due date ≥ today; security question key enum + answer min 2 chars, required only when `requireSecurityAnswer`). Export `SECURITY_QUESTION_KEYS`. Error messages are message keys (`Forms.errors.*` pattern like `src/lib/validation/support.ts`).
- `src/lib/portal/details.ts` (server-only): `getDriverDetails(enrollmentId)` (profile + enrollment fields, locked flag, has security question) with the user's client.
- `src/lib/portal/details-actions.ts` (`"use server"`): `saveDriverDetails(enrollmentId, input)` → Zod → `rpc('save_driver_details')` → maps DB errors to field errors → `revalidatePath`, returns `{status}` like `PublicFormResult`.
- `src/app/[locale]/portal/details/[enrollmentId]/page.tsx` + `src/components/portal/driver-details-form.tsx` (client, React Hook Form + zodResolver): fields in spec order; County `<select>` from `listCounties()` (`src/lib/courts/counties.ts`); locked fields rendered read-only with a note "Locked after the final exam started — contact support"; "Where do I find this?" button opens a Dialog with an original `public/placeholder/sample-citation.svg` (number area highlighted, alt text) and a link to the selected County's `case_lookup_url`. After save → redirect to `?next=` if it's a safe portal path (`src/lib/auth/return-path.ts`) else `/portal`.
- `src/app/[locale]/portal/profile/page.tsx`: "My profile" card (initials avatar via `initialsOf`, name, email + "Contact support to change it", DOB "As on your license", phone), note "We send these to the DMV and the court exactly as written", "Edit details" button (→ details page of the latest enrollment, hidden when none), "Enrollment history" card (list of own enrollments: course language, status, dates), "Privacy choices and data deletion" link (→ `/privacy`; ticket 14 adds the real flow).
- `messages/{en,ja,es,ru}.json`: namespaces `DriverDetails`, `Profile`.

## Test slices

1. Unit `src/lib/validation/driver-details.test.ts`: placeholder DOBs `1900-01-01`/`1900-02-02` rejected; age 14 rejected, 15 ok, 101 rejected; CA license `A1234567` ok, `12345678`/`a1234567` rejected; non-CA license free-form; citation lower-case is upper-cased, `AB#1` rejected; past due date rejected.
2. DB `tests/db/driver-details.db.test.ts`: student saves details via RPC for own enrollment; another student cannot (42501); direct `profiles` update with dob `1900-01-01` rejected by trigger; after `lock_driver_details` the student cannot change legal name (RPC or direct update) but can change phone; admin override without reason fails, with reason succeeds and writes `audit_log`; security answer stored only as a bcrypt hash; `has_driver_details` true after save.

## Risks

- Placeholder DOBs must be rejected by both Zod and Postgres.
- The lock must not be bypassable via a direct PostgREST `profiles` update (the trigger covers every path except the override flag).
- No PII in URLs: enrollment id in the path is fine; never put names/license numbers in query strings.
