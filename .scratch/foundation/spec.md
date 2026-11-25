# Phase 1: Foundation

Status: ready-for-agent

Source: phase 1 of the build plan in `spec.md`, refined by the phase 1 grilling session (2026-11-25). Vocabulary follows `GLOSSARY.md`.

## Problem Statement

The project spec describes a full multilingual traffic school, but the repo has no code. Before any public page, course or payment can be built, the project needs a working base: an app that runs in four UI languages, a database whose full structure and access rules are in place and tested, a way for Students to sign up and sign in, a way to create the first Admin, and the shared page frame (announcement bar, header, footer, 404) that every later page sits inside. Without this base, every later phase would have to invent these pieces as it goes, and access rules would be added late and inconsistently.

## Solution

A Next.js and TypeScript app, running locally against a local Supabase in Docker, with:

- The complete database from the project spec (all tables, with row-level security on every one), migrated and seeded, so later phases build features on a structure that already exists and has been reviewed.
- Sign-up, sign-in with password, sign-in with magic link, and password reset, in all four UI languages.
- Roles enforced by the database: a Student can never become an Admin from inside the app; the first Admin is created by a seed script.
- The shared page frame: announcement bar, sticky header with theme toggle, language switcher and user menu, footer with the demo disclaimer, skip link, and a custom 404 page.
- Empty, protected Portal and Admin areas, so the access rules can be proven from end to end now.
- One command that runs lint, type-check and all tests, which must pass before any work counts as done.

## User Stories

### Visitor: browsing and language

1. As a Visitor, I want to open the site at `/` and see it in English, so that the default experience needs no choice from me.
2. As a Visitor, I want to open `/ja`, `/es` or `/ru` and see the site in that UI language, so that I can read it in my own language.
3. As a Visitor, I want a URL I typed or followed to always show the UI language that URL names, so that a link never changes language behind my back.
4. As a Visitor, I want to switch the UI language from the header and stay on the same page, so that I don't lose my place.
5. As a Visitor, I want the language switcher to show a flag and short code, and open a 2×2 grid of language cards with each language's native name, so that I can find my language even if I can't read the current one.
6. As a Visitor, I want my UI language choice remembered on my next visit to the home page, so that I don't have to pick it again.
7. As a Visitor, I want to toggle between light and dark themes with a pill switch, so that the site is comfortable to read.
8. As a Visitor, I want my theme choice remembered, so that the site doesn't flash back to the other theme.
9. As a Visitor, I want to see the current announcement in a bar at the top of every page, in my UI language, so that I notice important news.
10. As a Visitor, I want to dismiss the announcement bar, and have it stay dismissed, so that it doesn't keep taking space.
11. As a Visitor, I want the announcement bar hidden when there is no published announcement for my UI language, so that I never see an empty bar.
12. As a Visitor, I want a sticky header with the logo and links to Courses, DMV Services, Courts, About, FAQs, Blog and Contact, so that I can find the main sections.
13. As a Visitor on a phone, I want the header links behind a hamburger menu, so that the header fits a narrow screen.
14. As a Visitor, I want a "Create account" button in the header, so that signing up is always one click away.
15. As a Visitor, I want a footer with links to courts, school rules, FAQ, blog, about, contact, privacy, terms, refunds and accessibility, plus the school's license placeholder, address, phone and email on separate lines, so that I can find school details.
16. As a Visitor, I want the footer to say clearly that this is a demo project and not a licensed school, so that I'm not misled.
17. As a Visitor, I want a friendly 404 page ("This page took a wrong turn") with a road-sign style card linking to Courses, Find your court, DMV services and Questions and answers, plus "Back to home", so that a bad link doesn't leave me stuck.
18. As a Visitor, I want the 404 page in my UI language, so that it is readable.
19. As a Visitor, I want header links to pages that aren't built yet to lead to the 404 page, so that nothing crashes.
20. As a Visitor using a keyboard, I want a "skip to content" link and visible focus outlines, so that I can move around without a mouse.
21. As a Visitor using a screen reader, I want every image and icon button to have a text label, so that I know what each one is.

### Student: sign-up and sign-in

22. As a Visitor, I want to sign up with first name, last name, email, password and preferred UI language, so that I get a Student account.
23. As a Visitor, I want clear, translated error messages when a sign-up field is invalid, so that I can fix it.
24. As a Visitor, I want to be told when my email is already registered, so that I sign in instead.
25. As a new Student, I want my profile created automatically from my sign-up details, so that the site greets me by name immediately.
26. As a new Student, I want a verification email after sign-up, so that I can confirm my email address.
27. As an unverified Student, I want to still be able to sign in, and see a "verify your email" banner with a resend option, so that I'm not blocked from looking around.
28. As a Student, I want to sign in with email and password, so that I reach my account.
29. As a Student, I want to sign in with a magic link sent to my email, so that I don't need my password.
30. As a Student, I want to request a password reset email and set a new password from it, so that I can recover my account.
31. As a Student, I want a generic message when sign-in fails, so that nobody can learn which emails are registered.
32. As a Student, I want to sign out from the user menu, so that my account is safe on a shared device.
33. As a signed-in Student, I want the header to show my initials and first name, with a menu linking to My courses, My certificates, My profile and Log out, so that my account is easy to reach.
34. As a signed-in Student, I want changing the UI language to also save it to my profile, so that it follows me to other devices.
35. As a Student signing in on a new device, I want the site to use the UI language saved in my profile when I arrive at a page whose URL doesn't name a language, so that it feels like my account.

### Student: portal and protection

36. As a signed-in Student, I want to open the Portal and see an empty placeholder for now, so that the route exists for later phases.
37. As a Visitor, I want opening the Portal to send me to sign in, and then back to the Portal afterwards, so that I land where I meant to go.
38. As a Student, I want the Admin area to show the 404 page, so that its existence isn't revealed.
39. As a Student, I want to read and edit my own profile's name and UI language, so that my details are correct.
40. As a Student, I want to be unable to see any other Student's profile, so that my details stay private.
41. As a Student, I want to be unable to change my own role, so that no Student can make themselves an Admin.

### Admin

42. As the project owner, I want a seed script that makes an existing account an Admin by email, so that the first Admin exists without any in-app escalation path.
43. As an Admin, I want to open the Admin area and see an empty placeholder for now, so that the route exists for later phases.
44. As an Admin, I want to read every profile, so that later admin screens can manage Students.
45. As an Admin, I want to create, edit and publish announcements per UI language, at the database level, so that the phase 5 admin screen only needs a UI on top.
46. As an Admin, I want the Admin area marked as not indexable by search engines, so that it never shows up in search results.

### Developer

47. As a developer, I want one command to start the local database (with seed data) and one to start the app, so that I can work offline.
48. As a developer, I want the complete database from the project spec created by migrations, with row-level security switched on for every table, so that later phases build on a reviewed structure.
49. As a developer, I want generated TypeScript types for the database, so that queries are type-checked.
50. As a developer, I want the seed to include California in the states table, one published announcement per UI language, and a sample of reference data later phases depend on, so that the app has something to show.
51. As a developer, I want a single check command that runs lint, type-check, unit tests, database tests and browser tests, so that "done" means one thing.
52. As a developer, I want caught emails (verification, magic link, reset) to be readable from tests, so that auth flows can be tested end to end.
53. As a developer, I want the brand name, license placeholder and contact details in one site config, so that the school can be renamed in one place.
54. As a developer, I want all UI text in per-language message files, with the non-English files marked as needing native-speaker review, so that translation work is visible.
55. As a developer, I want an environment example file listing every variable the project will need, so that setup is predictable.

## Implementation Decisions

### Stack and environment

- Next.js latest stable with the App Router, TypeScript in strict mode with no `any`, pnpm, Tailwind CSS and shadcn/ui, next-themes, next-intl, React Hook Form with Zod, `@supabase/ssr`.
- Supabase runs locally in Docker through the Supabase CLI (run via pnpm, not a global install). Mailpit, which ships with local Supabase, catches auth emails. No hosted project and no Vercel deploy in phase 1.
- Visual style: shadcn/ui neutral theme with a single green accent (road-sign green), in both light and dark mode. The logo is a text wordmark from the site config.

### Internationalisation

- Four UI languages: `en` (default, no URL prefix), `ja`, `es`, `ru`, using next-intl's "prefix only when not default" mode with automatic browser-language redirects turned off.
- The UI language resolution rule, in priority order: a language named in the URL always wins; otherwise, for the unprefixed root only, the saved preference (profile for a signed-in Student, cookie for a Visitor) may redirect; otherwise English. A deep unprefixed path such as `/faq` is always English and never redirects. This rule is a single pure function so it can be unit tested.
- The language switcher keeps the current path, sets the cookie, and for a signed-in Student also updates the profile.
- The "suggest your language from browser settings" banner is not in phase 1 (phase 2).
- Claude writes all four message files; the non-English ones carry a note that a native speaker must review them before launch.

### Database

- All tables from section 13 of the project spec are created in phase 1, plus two the spec needs but did not list: a Stripe events table (event id unique, for webhook idempotency) and a security questions table (question plus hashed answer, for identity checks). Every table has a UUID primary key and created/updated timestamps maintained by a shared trigger.
- Row-level security is enabled on every table. Policies follow the access column of the project spec. Tables marked "server only" have no client-facing policies at all, so only the service role can touch them. Answer options are never readable by any client role.
- The admin check is a `security definer` function, `is_admin()`, used by every policy that grants admin access. No `profiles` policy queries `profiles` directly (that recurses).
- A trigger on new auth users creates the matching profile, copying first name, last name and preferred UI language from sign-up metadata, with role always set to student regardless of metadata.
- A trigger on profile updates rejects any change to the role column unless the caller is an Admin or the service role.
- The driver-details lock trigger (legal name, DOB, license number locked once the final exam starts) is created in phase 3 with the exam, not here; phase 1 only creates the columns.
- Seed data: California in the states table (25 questions, 70% pass, 2 attempts, 90 days, report times 09:00/13:00/17:00), other states present but inactive, one published announcement per UI language, the one course row with its eight section titles. Other reference data (courts, FAQ, content) is seeded by the phase that uses it.
- A separate admin seed script takes an email and sets that account's role to admin using the service role. It refuses if the account does not exist.
- Database types are generated from the local schema and committed; regeneration is a package script.

### Auth

- Email and password, magic link, and password reset, all through Supabase Auth. Google sign-in is not in phase 1.
- Sign-up requires email confirmation, but an unconfirmed Student can still sign in and sees a "verify your email" banner with a resend action. Phase 4 blocks checkout until the email is confirmed.
- Auth emails use Supabase's built-in templates, in English only, with a `TODO(spec):` to translate them when Resend arrives.
- Sign-up, sign-in and reset use shared Zod schemas on client and server; all auth mutations are server actions.
- Sign-in failure messages are generic.

### Routing and protection

- One Next.js middleware composes next-intl's locale handling with Supabase session refresh.
- Portal routes require a signed-in user; a Visitor is redirected to sign-in with a return path, and returned there afterwards. The return path is validated to be a same-site relative path.
- Admin routes require the admin role, checked on the server; anyone else gets the 404 page.
- Portal and Admin pages are marked not indexable.
- Header and footer links to pages not yet built simply point at their final paths and fall through to the 404 page.

### Layout

- Announcement bar: reads the published announcement for the current UI language from the database; dismissal is remembered per announcement in a cookie; hidden when there is none.
- Header: logo, nav links, theme toggle, language switcher (flag and code, opening a 2×2 grid of language cards), and either "Create account" or the user menu (initials, first name, My courses, My certificates, My profile, Log out). Mobile uses a hamburger menu.
- Footer: link groups, license placeholder, address, phone and email on separate lines, current year, demo disclaimer. All values come from the site config.
- The floating AI widget is not in phase 1.

### Quality gate

- A single `check` package script runs lint (ESLint and Prettier), type-check, Vitest (unit and database tests) and Playwright. Every ticket must pass it before it counts as done.

## Testing Decisions

- Good tests exercise external behaviour only: what a real user, signed in as a given role, can and cannot do. They do not assert on internal function calls, component structure or SQL text.
- Two seams, both against the real local stack with nothing mocked:
  1. **Database as a real user.** Vitest tests create users through Supabase Auth, sign in as a Student, a second Student, an Admin and a Visitor, then attempt reads and writes through the normal client. They cover: a Student can read and update their own profile but not another's; a Student cannot change their own role; profile creation on sign-up, including that sign-up metadata cannot set the role to admin; Visitors read only published announcements and cannot write any; Admins can read all profiles and write announcements; answer options and every server-only table return nothing to any client role; the admin seed script promotes an existing account and refuses an unknown email.
  2. **Browser with Playwright.** Tests against the running app cover: sign-up, the verification email (read from Mailpit) and the unverified banner; password sign-in and sign-out; magic-link sign-in; password reset; `/faq` and other deep unprefixed paths never redirecting even with a saved non-English preference; the root redirecting to the saved preference; the switcher keeping the current path; a Visitor sent from the Portal to sign-in and back; a Student getting 404 on the Admin area; an Admin reaching the Admin area; the 404 page in each UI language; the theme toggle persisting; the announcement bar showing, dismissing and staying dismissed; the skip link; the mobile menu at 375 px width.
- Plain Vitest unit tests cover pure logic only: the UI language resolution function, the return-path validator, and the sign-up and sign-in Zod schemas.
- There is no prior art in the codebase; phase 1 establishes the patterns (test user factory, Mailpit helper, per-test database cleanup) that later phases reuse.

## Out of Scope

- Every public page beyond the layout and 404 (home, courses, courts, FAQ, blog, legal pages and the rest): phase 2.
- The ticket-state selector, the "suggest your language" banner, the "Got a problem?" form and SEO (metadata, hreflang, sitemap, JSON-LD): phase 2.
- Driver and court details, the details lock trigger, the course player, quizzes, identity checks and the final exam: phase 3.
- Payments, the email-verified-before-checkout gate, certificates: phase 4.
- Reporting, all admin screens (including editing announcements in the UI), audit logging of admin writes: phase 5.
- The AI widget and assistant: phase 6.
- Google sign-in, translated auth emails (Resend), PostHog, Sentry, CSP headers, rate limiting, hosted Supabase, Vercel deploy.

## Further Notes

- `spec.md` remains the source of truth for everything not decided here; this spec records where phase 1 refines it.
- Building every table now means later phases may need follow-up migrations as their real code reveals better shapes. That is expected; each phase should migrate forward, never edit an already-applied migration.
- No ADRs were recorded in the grilling session: none of the decisions met all three of hard to reverse, surprising, and a real trade-off.
