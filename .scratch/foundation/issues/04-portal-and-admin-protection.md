# 04: Portal and Admin protection

**What to build:** A signed-in Student can open an empty Portal; a Visitor who opens it is sent to sign in and then returned to it. Only Admins can open the empty Admin area; everyone else gets the 404 page. The project owner can make the first Admin with a seed script. When a signed-in Student switches UI language, it is saved to their profile and used when they arrive at the bare root on another device. See `.scratch/foundation/spec.md` (Routing and protection, Internationalisation, Database).

**Blocked by:** 02 (Language switcher and announcement bar), 03 (Accounts)

**Status:** resolved

- [x] One middleware composes next-intl locale handling with Supabase session refresh
- [x] Portal requires sign-in; redirect carries a return path validated to be a same-site relative path (unit tested)
- [x] Admin area checks the admin role on the server; non-Admins get the 404
- [x] Portal and Admin pages are marked not indexable
- [x] Admin seed script promotes an existing account by email using the service role and refuses an unknown email (database test)
- [x] If ticket 02 used a placeholder admin check for `announcements`, switch it to `is_admin()`
- [x] Switcher saves to the profile for signed-in Students; the profile preference drives the bare-root redirect
- [x] Playwright: Visitor → Portal → sign-in → back to Portal; Student gets 404 on Admin; Admin reaches Admin; Student's saved language applies on a fresh browser at `/`
- [x] `pnpm check` passes

## Comments

- 2026-11-25: Resolved. Implemented and merged into the `foundation` integration branch (ticket work up to 4aee2a5); code-review fixes in fb8dcff. `pnpm db:reset && pnpm check` passes on fb8dcff (unit 61, db 69, e2e 38).
