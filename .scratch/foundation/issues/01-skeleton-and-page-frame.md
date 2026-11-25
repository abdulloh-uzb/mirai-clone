# 01: Skeleton and page frame

**What to build:** A Visitor can open the app locally at `/`, `/ja`, `/es` and `/ru` and see a placeholder page in that UI language, inside the shared page frame: sticky header (text wordmark, nav links to Courses, DMV Services, Courts, About, FAQs, Blog, Contact, a light/dark pill toggle, a hamburger menu on mobile), footer (link groups, license placeholder, address, phone and email on separate lines, current year, "Demo project — not a licensed school"), a skip-to-content link, and a friendly 404 page in every UI language. Nav links to pages not yet built land on the 404. Local Supabase runs in Docker and the developer has one `check` command that must pass. See `.scratch/foundation/spec.md` (Stack and environment, Layout, Quality gate).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Next.js (latest stable), TypeScript strict, pnpm, Tailwind, shadcn/ui (neutral theme + one road-sign green accent), next-themes, next-intl with `en` unprefixed and `ja`/`es`/`ru` prefixed, automatic browser-language redirects off
- [ ] Message files for all four UI languages; non-English files carry a "needs native-speaker review" note
- [ ] Site config holds brand name, license placeholder `DEMO-0000` and contact details; header and footer read only from it
- [ ] Local Supabase via the CLI run through pnpm; package scripts to start/reset the database and to generate database types; `.env.example` lists every variable from section 15 of `spec.md`
- [ ] 404 page ("This page took a wrong turn", road-sign style card with 4 links, "Back to home") renders in each UI language
- [ ] Theme choice persists across reloads; skip link and visible focus states work
- [ ] `pnpm check` runs ESLint + Prettier, type-check, Vitest and Playwright, and passes
- [ ] Playwright covers: each UI language root renders in its language; an unbuilt nav link shows the 404; theme toggle persists; skip link; mobile menu at 375 px
