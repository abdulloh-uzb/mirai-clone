# 13 Global UI restyle

**Status:** resolved
**Blocked by:** none
**Plan:** `.scratch/lms/plans/13-ui-restyle.md`

Spec §4 (as edited by the owner): make our public site's look and layout match the reference site per .scratch/lms/design-notes.md — layout/style only, no copied brand/copy/images.

- [x] Tokens, header, footer, announcement bar, AI widget shell, home, courses, 404

## Comments

- Part 1 landed on `lms` (feature 34493c9): tokens, fonts, buttons, header, theme switch, language tiles, announcement bar, footer, help widget shell, home hero + steps, 404. Remaining: home items 10–14, PageHero + FAQ/courts inner layouts (items 15–17) — follow-up run.
- Part 2 done: home items 10-14, PageHero on courses/courts/dmv-services/faq/contact/blog/about, FAQ sticky category list, courts card restyle. Reviews keep the accessible carousel; the marquee strip is decorative (aria-hidden, static under reduced motion).
