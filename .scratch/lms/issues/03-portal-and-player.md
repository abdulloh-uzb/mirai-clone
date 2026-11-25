# 03 Portal dashboard and course player

**Status:** resolved
**Blocked by:** 01, 02
**Plan:** `.scratch/lms/plans/03-portal-and-player.md`

Spec §6 portal dashboard (enrolled state), portal nav, spec §7 course player: sections unlock in order, lessons, all block types, autosave, minimum time (visible tab + active in last 2 min), access banners.

- [x] Progress RPCs with time checks
- [x] Player UI for all 7 block types, mobile 375 px
- [x] Dashboard: progress ring, continue, days left, due-date countdown

## Comments

- Landed on `lms` (merge 1940f2d). Unit 194 pass, course-progress DB 6 pass. Added `expire_enrollment_if_due`.
