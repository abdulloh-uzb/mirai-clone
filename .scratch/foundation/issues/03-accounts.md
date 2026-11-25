# 03: Accounts

**What to build:** A Visitor can sign up with first name, last name, email, password and preferred UI language and becomes a Student whose profile is created automatically. Students can sign in with a password or a magic link, reset their password, and sign out. Signed-in Students see their initials and first name in the header with a user menu (My courses, My certificates, My profile, Log out). Unverified Students can sign in but see a "verify your email" banner with a resend action. Nobody can make themselves an Admin. See `.scratch/foundation/spec.md` (Database, Auth).

**Blocked by:** 01 (Skeleton and page frame)

**Status:** ready-for-agent

- [ ] `profiles` table with the signup fields and the later driver-detail columns from section 13 of `spec.md`; RLS: own row read/update, Admin reads all
- [ ] `is_admin()` as a `security definer` function; no `profiles` policy queries `profiles` directly
- [ ] Trigger creates the profile on sign-up from metadata, always with role `student` even if metadata says otherwise
- [ ] Trigger rejects role changes unless the caller is an Admin or the service role
- [ ] Sign-up, sign-in, magic link, reset and sign-out pages/actions in all four UI languages; shared Zod schemas client and server; generic sign-in failure message
- [ ] Auth emails use Supabase's English templates with a `TODO(spec):` to translate them later
- [ ] Test helpers: a user factory that signs in as Student / second Student / Admin / Visitor, and a Mailpit helper that reads caught emails
- [ ] Database tests: profile created on sign-up; metadata cannot set admin; Student cannot read another's profile; Student cannot change own role; Admin reads all profiles
- [ ] Playwright: sign-up → verification email → banner; password sign-in and sign-out; magic-link sign-in; password reset; user menu shows initials and first name
- [ ] Unit tests for the sign-up and sign-in schemas
- [ ] `pnpm check` passes
