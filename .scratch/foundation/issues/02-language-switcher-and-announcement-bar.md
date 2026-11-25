# 02: Language switcher and announcement bar

**What to build:** A Visitor can switch UI language from the header and stay on the same page; the choice is remembered in a cookie and used when they next arrive at the bare root `/`, but an explicit URL always wins: a deep unprefixed path like `/faq` is always English and never redirects. Every page shows the current published announcement for the UI language in a top bar, which can be dismissed and stays dismissed. See `.scratch/foundation/spec.md` (Internationalisation, Layout, Database).

**Blocked by:** 01 (Skeleton and page frame)

**Status:** resolved

- [x] Switcher shows flag + short code and opens a 2×2 grid of language cards with native names; switching keeps the current path and sets the cookie
- [x] UI language resolution is one pure function: URL language wins; otherwise saved preference may redirect only the bare root; otherwise English. Unit tested
- [x] `announcements` table (locale, message, published, plus standard id/timestamps) with RLS: anyone reads published rows; only Admins write (use a placeholder admin check until ticket 03 provides `is_admin()`, or coordinate with 03 if it has landed). Seed one published message per UI language
- [x] Bar hidden when no published announcement exists for the UI language; dismissal remembered per announcement in a cookie
- [x] Database test: a Visitor reads only published announcements and cannot insert, update or delete
- [x] Playwright: switcher keeps the path; `/faq` with a saved `ru` preference stays English; `/` with a saved `ru` preference goes to `/ru`; bar shows, dismisses, stays dismissed after reload
- [x] `pnpm check` passes

## Comments

- 2026-11-25: Resolved. Implemented and merged into the `foundation` integration branch (ticket work up to b86a074); code-review fixes in fb8dcff. `pnpm db:reset && pnpm check` passes on fb8dcff (unit 61, db 69, e2e 38).
