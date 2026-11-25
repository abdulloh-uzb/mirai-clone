# Plan 13: Global UI restyle

**Goal:** `.scratch/lms/issues/13-ui-restyle.md` — make the public site's look and layout follow `.scratch/lms/design-notes.md` (owner's edit to spec §4). Read that file fully; it is the plan's main body. Implement **P0, P1 and P2 items 15, 18, 19, 20** from its section 5. Items 16–17 (FAQ/courts inner layouts) are optional if time allows.

## Rules
- Layout and style only. Never use the reference site's name, logo, images, illustrations or copy. All illustrations are original inline SVG/CSS (simple flat vector shapes), with light and dark variants and alt text (or `aria-hidden` when decorative).
- All copy through `messages/*.json` (4 languages); brand/contact only from `src/config/site.ts`.
- Keep every existing feature and test hook: skip link, announcement dismiss, language switcher behaviour (keeps path, saves preference), theme toggle, mobile menu, "Got a problem?" dialog, user menu, demo footer note, existing headings/text the e2e specs assert on (grep `tests/e2e` for `getByRole`/`getByText` before renaming anything visible). Don't run Playwright, but don't break selectors.
- Header nav: keep Blog in the nav (spec §4 original list) after FAQs.
- The floating help widget (item 19) is a shell: collapsed button "Ask AI anything…" + tour card; clicking dispatches `window.dispatchEvent(new Event("open-ai-assistant"))`. Ticket 12 builds the real panel and listens for that event. Hide it on `/portal/exam/*`.
- `prefers-reduced-motion`: no marquee/car animation. Contrast WCAG AA in both themes (sky button uses dark text).
- Fonts via `next/font/google` (Inter + Noto Sans JP), `display: swap`.
- Performance: hero art inline SVG or optimized; no large images (Lighthouse ≥ 90 mobile target).

## Test slices
- Unit tests unaffected; run `pnpm lint`, `pnpm typecheck`, `pnpm test:unit`.
- Update any e2e spec text expectations you intentionally change (without running them).
