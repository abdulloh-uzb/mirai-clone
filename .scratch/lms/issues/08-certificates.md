# 08 Certificates and verify page

**Status:** resolved
**Blocked by:** 05
**Plan:** `.scratch/lms/plans/08-certificates.md`

Spec §9: PDF certificate on pass (@react-pdf/renderer, QR to /verify/[certNo]), private bucket + signed URL, completion_reports queued, /portal/certificates with empty states, /verify/[certNo] public page.

- [x] Certificate issued once per enrollment
- [x] Verify page shows valid/invalid + completion date only

## Comments

- Landed on `lms` (merge ba6736e). Unit 232 pass, certificates DB 4 pass. TODO(spec): PDF labels English only (fonts). Added /verify index.
