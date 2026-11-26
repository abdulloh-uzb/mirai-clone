# 11 Admin content and operations

**Status:** resolved
**Blocked by:** 09, 10
**Plan:** `.scratch/lms/plans/11-admin-rest.md`

Spec §11: Reporting (batch history, queue, edit + re-send, CSV), Content (sections, lessons, blocks, question bank per locale, translation status), Courts, Site content (FAQ, pages, announcements, What's new, blog, prices, coupons, reviews), Tickets, Settings (admins, state config, notify-me lists), AI logs page shell.

- [x] All writes via adminWrite

## Comments

- Landed on `lms` (feature dc08a9b). Unit 243 pass, admin-content DB 3 pass. Reporting module moved to ticket 09. Admin pages hard-coded English (TODO(spec)).
