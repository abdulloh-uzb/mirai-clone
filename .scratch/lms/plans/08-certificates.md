# Plan 08: Certificates and verify page

**Goal:** `.scratch/lms/issues/08-certificates.md` (spec §9 first bullets, §5.3 `/verify/[certNo]`, §6 `/portal/certificates`). Read `.scratch/lms/spec.md` decision 4.

Builds on 05 (`submit_exam` → enrollment `completed`).

## Dependencies

`pnpm add @react-pdf/renderer qrcode` and `pnpm add -D @types/qrcode`.

## Data — migration `certificates_flow`

- Storage: `insert into storage.buckets (id, name, public) values ('certificates', 'certificates', false) on conflict do nothing;` No storage policies for clients (service role only).
- `public.issue_certificate(p_enrollment_id uuid) returns public.certificates` (security definer, service-role only): enrollment `completed` with a passed exam; idempotent (`on conflict (enrollment_id) do nothing` then select); `cert_no` = `'RR-' || to_char(now(),'YYYY') || '-' || upper(substr(md5(gen_random_uuid()::text),1,8))` (unique; retry on conflict); inserts `completion_reports (status 'queued')` once.
- `public.verify_certificate(p_cert_no text) returns jsonb` (security definer, granted to `anon, authenticated`): `{ valid: boolean, completedAt: date | null }` — valid when found and `revoked_at is null`. Nothing else (no names).
- `certificates.pdf_path` set by server after upload.

## Files

- `src/lib/certificates/issue.ts` (server-only): `issueCertificateFor(enrollmentId)`: `rpc('issue_certificate')` (service client) → if `pdf_path` null: gather data (profile legal name, license masked `•••• 1234` style via `maskLicense`, county court name, citation, completion date, cert no) → render PDF → upload to `certificates/<user_id>/<cert_no>.pdf` → set `pdf_path`. Idempotent.
- `src/lib/certificates/mask.ts` (pure): `maskLicense("A1234567") → "****4567"`; `certificateNumberValid(s)`.
- `src/lib/certificates/pdf.tsx` (server-only): `@react-pdf/renderer` document: school name + `licenseNumber` from `siteConfig`, "Certificate of Completion", legal name, masked license, court (County Superior Court), citation number, completion date, certificate number, QR code (data URL from `qrcode` of `<NEXT_PUBLIC_SITE_URL>/verify/<certNo>`), demo disclaimer line. Labels in the Course language (pass a small label dictionary per locale; use English font-safe text — for ja use a bundled font? `TODO(spec)`: keep PDF labels in English plus the course language name, since built-in PDF fonts lack CJK/Cyrillic glyphs; register `public/fonts/NotoSans-Regular.ttf` only if it's already present, otherwise English labels).
- Hook: in `src/lib/portal/exam-actions.ts` `submitExam`, when `passed` → `await issueCertificateFor(enrollmentId)` (errors logged; a retry path: `/portal/certificates` calls `issueCertificateFor` for completed enrollments lacking a certificate/PDF).
- `src/lib/certificates/download.ts` + `src/app/api/certificates/[certNo]/route.ts`: signed-in owner only (check via user client select on `certificates`), service client `createSignedUrl(path, 60)` → 302 redirect. No PII in the URL besides the cert number.
- `src/app/[locale]/portal/certificates/page.tsx`: list (cert no, completion date, Download button). Empty states: no enrollment → "Buy the course" (`/portal`); in progress → "Continue your course" (dashboard continue URL).
- `src/app/[locale]/verify/[certNo]/page.tsx` (public, `noindex`): input form to check another number; result "Valid certificate — completed on {date}" or "We couldn't find a valid certificate with this number". Add to the public header? No — footer link not needed.
- Email on issue: `certificateReadyEmail` (4 languages) with link to `/portal/certificates`.
- `messages/*.json`: `Certificates`, `Verify`.

## Test slices

1. Unit: `maskLicense`, `certificateNumberValid`; PDF render smoke test (`renderToBuffer` returns a buffer starting with `%PDF`).
2. DB `tests/db/certificates.db.test.ts`: `issue_certificate` on completed enrollment creates one certificate + one queued report; second call returns same cert, no second report; not completed → error; `verify_certificate` valid/invalid/revoked returns only valid + date; student A cannot select student B's certificate; anon cannot call `issue_certificate`.

## Risks

- Only valid/invalid + date on the public verify page (no names).
- Private bucket, signed URLs only, short expiry.
