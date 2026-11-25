# 07: Courses, eligibility, Citation-state selector and waitlists

**What to build:** `/courses` with language cards and the course panel, `/eligibility` with its 5 questions, the "Where is your ticket from?" selector with the State waitlist, and the Classroom waitlist. Buy buttons route to sign-up or the Portal with the chosen course language. See `.scratch/public-site/spec.md` (Honesty rules, Database changes, Pages).

**Blocked by:** 06 (rate limit and form helper), 04 (Counties for the Classroom waitlist)

**Status:** ready-for-agent

- [ ] Migration: `classroom_waitlist` (email, county_id, locale; server insert, Admin read); seed all 50 states + DC (CA active), classroom `courses` row with `active = false` and price 12499; regenerate DB types
- [ ] `/courses`: 4 language cards (flag, native name, "Original course" under English, "LIVE", selected check; selection in `?course=`), course panel with features (demo-honest wording), device SVG, "Lessons, quizzes and the final exam in {language}.", price from DB, "Start in {language}"; below: 8-section syllabus from `sections`, rules, reporting schedule, refund summary, Classroom waitlist card
- [ ] Buy buttons: Visitor → `/signup?course=<lang>` (sign-up keeps it), Student → `/portal?course=<lang>` showing "Payments arrive soon"
- [ ] `/eligibility`: pure result function in `src/config/states/ca.ts`, 5 yes/no questions, result with blocking answer and next step
- [ ] Citation-state selector chip (used here and by ticket 09): 51 states, cookie `ticket_state`, inactive → "Coming soon — notify me" with State waitlist form (email)
- [ ] `Course` + `offers` JSON-LD; metadata; sitemap entries
- [ ] Unit: eligibility logic, form schemas. E2E: language selection and both buy-button routes; eligibility yes and no paths; selector + notify me; classroom waitlist; mobile; axe clean. DB: clients cannot read either waitlist
- [ ] `pnpm check:locked` passes
