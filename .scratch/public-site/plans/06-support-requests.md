# Plan 06: Support requests (contact, ADA, "Got a problem?")

**Goal:** build `.scratch/public-site/issues/06-support-requests.md`: three public forms that create Support requests (`tickets` rows), guarded by a honeypot and a Postgres rate limit, with confirmation emails through a new `EmailSender`.

## Files

- `supabase/config.toml`: `[storage] enabled = true` (it is `false` today, so the bucket cannot work). Restart the shared stack under the lock: `scripts/with-stack-lock.sh 'pnpm db:stop && pnpm db:start'`. Check free RAM (`free -m`) before and mention the cost in your report.
- `supabase/migrations/<ts>_support_requests.sql` (new): see Data.
- `src/lib/database.types.ts`: regenerate.
- `next.config.ts`: `experimental.serverActions.bodySizeLimit = "6mb"` (the default 1 MB is below the 5 MB screenshot limit).
- `src/lib/validation/support.ts` (new, shared client + server): Zod schemas `contactSchema`, `adaSchema`, `bugReportSchema`, plus the honeypot field name constant and the list of form error keys (same pattern as `src/lib/validation/auth.ts`: messages are keys under `Forms.errors`). Topic values `general | course | payment | technical`, preferred contact `email | phone` as `z.enum([...])` const arrays (these are not DB enums, so `check-conventions` allows them). Limits: name ≤ 100, email ≤ 320, message/need/whatHappened 10–5000 chars, phone optional ≤ 30. Screenshot validated separately on the server: type in png/jpeg/webp, size ≤ 5 MB (export the constants so the client `accept` attribute and the server agree).
- `src/lib/forms/public-form.ts` (new, server-only): `runPublicForm({ form, schema, input, honeypot, handle })`:
  1. honeypot filled → return `{ status: "ok" }` without doing anything (fake success);
  2. `hit_rate_limit('form:<form>:ip:<ip>', 5, 600)` via `createServiceClient()` → `false` gives `{ status: "error", formError: "rateLimited" }`;
  3. `schema.safeParse` → field error keys;
  4. `handle(data)`; any thrown error → `formError: "generic"` (log it server-side).
  `clientIp()` reads the first entry of `x-forwarded-for`, then `x-real-ip`, else `"unknown"` (from `headers()`). E2E tests set a unique `X-Forwarded-For` per test so rate limits don't leak between tests.
- `src/lib/support/actions.ts` (new, `"use server"`): `submitContact(input, locale)`, `submitAdaRequest(input, locale)`, `submitBugReport(formData: FormData, locale)`. Insert with the service client. Bug report: if signed in (`getCurrentAccount()` from `src/lib/auth/current-account.ts`), use the account's email and `user_id` and ignore any email sent by the client; upload the screenshot to `support-attachments/<ticket-id or uuid>/<random>.<ext>` with the service client and store the path in `attachment_path`. Contact and ADA also set `user_id` when signed in.
- `src/lib/email/` (new, server-only):
  - `types.ts`: `interface EmailSender { send(message: { to: string; subject: string; text: string; replyTo?: string }): Promise<void> }`.
  - `mailpit.ts`: local sender that POSTs to Mailpit's HTTP API `${MAILPIT_URL}/api/v1/send` (`{From:{Email}, To:[{Email}], Subject, Text}`). Verified working on the stack (Mailpit v1.31). The SMTP port is not exposed by the local stack, so this replaces "SMTP" from the spec: leave `// TODO(spec): spec says SMTP; local Mailpit is reached over its HTTP send API`.
  - `resend.ts`: `fetch("https://api.resend.com/emails")` with `Authorization: Bearer ${RESEND_API_KEY}`; no new dependency.
  - `index.ts`: `getEmailSender()` → Resend when `RESEND_API_KEY` is set, else Mailpit. From address: a `noreply@` on the domain of `siteConfig.contact.email` (derive it; never hard-code the brand).
  - `templates.ts`: plain English text for contact confirmation, ADA confirmation and the two staff notifications. `// TODO(spec): React Email templates in 4 languages (phase 4).`
  - Add `MAILPIT_URL` to `src/lib/env.ts` as a server value (default `http://127.0.0.1:54324`) and `EMAIL_FROM` only if you need it; update `.env.example` comments ("Email via Resend when set, else local Mailpit").
- `src/components/forms/` (new, client): generic field parts for public forms (`TextField`, `TextareaField`, `SelectField`/radio group, `Honeypot`, `FormAlert`, `SubmitButton`) translating errors from `Forms.errors`. Model them on `src/components/auth/form-parts.tsx` but don't refactor the auth forms. Use `react-hook-form` + `@hookform/resolvers/zod` like the auth forms. The honeypot: visually hidden input (not `display:none`), `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`, named e.g. `website`.
- `src/components/support/contact-form.tsx`, `ada-request-form.tsx`, `bug-report-dialog.tsx` (new, client). The dialog: add the shadcn `dialog` component to `src/components/ui/` (`pnpm dlx shadcn add dialog`, or hand-write it on `radix-ui` like the existing ui files). Page URL field: `window.location.href`, read-only. Email: prefilled and `readOnly` when an `accountEmail` prop is passed. Screenshot: `<input type="file" accept="image/png,image/jpeg,image/webp">`. Success replaces the form with a status message.
- `src/components/layout/announcement-bar.tsx` / `dismissible-announcement.tsx`: add a "Got a problem?" button in the bar that opens the dialog. `src/components/layout/site-footer.tsx`: same trigger always present in the footer (covers a dismissed or absent bar). Pass the signed-in email from the server (`getCurrentAccount()`), never trust it from the client.
- `src/app/[locale]/contact/page.tsx` (new): H1, intro, contact details from `siteConfig`, `ContactForm`. Metadata; add `/contact` to `staticSitemapPages` in `src/lib/seo/sitemap-pages.ts`.
- `src/app/[locale]/accessibility/page.tsx` (new): H1, a short placeholder statement from messages (ticket 02 replaces it with the `pages` row `accessibility`; mark `// TODO(ticket 02)`), then `AdaRequestForm`. Metadata; sitemap entry.
- `messages/{en,ja,es,ru}.json`: namespaces `Forms` (shared labels, `errors`, `rateLimited`, success), `Contact`, `Accessibility`, `BugReport`.

## Data

Migration `support_requests`:
- `public.rate_limits`: `key text not null`, `window_start timestamptz not null`, `hits integer not null default 0`, `primary key (key, window_start)`, index on `window_start`. RLS on, no policies, `revoke all ... from anon, authenticated`.
- `public.hit_rate_limit(key text, max integer, window_seconds integer) returns boolean`, `language plpgsql security definer set search_path = ''`:
  - window start = `to_timestamp(floor(extract(epoch from now()) / window_seconds) * window_seconds)`;
  - `insert ... on conflict (key, window_start) do update set hits = rate_limits.hits + 1 returning hits`;
  - prune: `delete from public.rate_limits where window_start < now() - interval '1 day'`;
  - returns `hits <= max` (true = allowed). Raise on `max < 1` or `window_seconds < 1`.
  - `revoke execute ... from public, anon, authenticated; grant execute ... to service_role` (server actions call it with the service client).
- `public.tickets`: add `page_url text check (length(page_url) <= 2048)`, `attachment_path text`, `details jsonb not null default '{}' check (jsonb_typeof(details) = 'object')`. No new client grants: clients cannot insert or read (server actions use the service role). Keep the existing "tickets: admin reads" policy.
  - `details`: contact `{ name, topic }`, ada `{ name, phone?, preferredContact }`, bug `{}`. `body` = message / need / what happened.
- Storage: `insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('support-attachments', 'support-attachments', false, 5242880, array['image/png','image/jpeg','image/webp'])`. No `storage.objects` policies for this bucket, so anon and authenticated get nothing.

## Interfaces

```ts
type PublicFormResult = { status: "ok" } | { status: "error"; formError?: FormErrorKey; fieldErrors?: Record<string, FieldErrorKey> };
runPublicForm<T>(opts: { form: "contact" | "ada" | "bug"; schema: z.ZodType<T>; input: unknown; honeypot: unknown; handle: (data: T) => Promise<void> }): Promise<PublicFormResult>
submitContact(input: unknown, locale: Locale): Promise<PublicFormResult>
submitAdaRequest(input: unknown, locale: Locale): Promise<PublicFormResult>
submitBugReport(formData: FormData, locale: Locale): Promise<PublicFormResult>
getEmailSender(): EmailSender
```
Ticket 07 reuses `runPublicForm`, the form components and `Forms.errors` for the two waitlists: keep them generic (the `form` name should be a string union that 07 can extend).

## Test slices (in order)

1. DB `tests/db/rate-limit.db.test.ts`: with the service client, `hit_rate_limit(k, 2, 1)` returns true, true, false; after ~1.1 s returns true again; distinct keys don't share counts; anon and authenticated clients cannot execute it.
2. DB `tests/db/support-requests.db.test.ts`: Visitor and a Student cannot select or insert `tickets`; Visitor and Student cannot upload to, list or download from `support-attachments` (a service-role upload exists first so "cannot read" is meaningful).
3. Unit `src/lib/validation/support.test.ts`: each schema's valid input, each field error key, topic/preferred-contact enums.
4. Unit for the email sender choice (`RESEND_API_KEY` set → Resend sender) without calling the network.
5. E2E `tests/e2e/support-requests.spec.ts` (each test sets its own `X-Forwarded-For` via `page.setExtraHTTPHeaders` and a unique email):
   - contact success → status message; confirmation to sender and notification to `siteConfig.contact.email` caught in Mailpit (`tests/support/mailpit.ts`); a `tickets` row of type `contact` exists (service client);
   - contact validation error shown translated (run one in `es`);
   - honeypot filled (fill the hidden field via `locator.fill` with `force`, or `evaluate`) → success shown, no `tickets` row and no email;
   - 6th submit from the same IP → rate-limit message;
   - ADA success + confirmation email; `/accessibility` renders in en + one other language;
   - "Got a problem?" from the announcement bar: page URL prefilled, screenshot upload (a tiny PNG fixture generated in the test) → `tickets` row type `bug` with `attachment_path` and the object exists in the bucket; signed-in Student sees their email prefilled and read-only (`tests/support/users.ts`);
   - axe clean on `/contact`, `/accessibility` and the open dialog.
6. E2E `tests/e2e/support-requests.mobile.spec.ts`: each of the three forms submits at 375 px.

## Risks

- Server-only boundary: service client, email senders and `hit_rate_limit` only in server code (`server-only` import).
- A rejected honeypot must look exactly like success to the client.
- Rate limiting must run before any DB insert, upload or email.
- Never trust a client-sent email for a signed-in user's bug report.
- Brand values only via `siteConfig` (`scripts/check-conventions.ts` scans `src`, `messages`, `supabase`).
- Enabling storage restarts the shared stack: do it only under the lock. Ticket 04 runs in parallel and also edits `supabase/config.toml` (`[db.seed]`) and `messages/*.json`: expect small merge conflicts.
- `TODO(spec)` to leave: Mailpit over HTTP instead of SMTP; plain English emails until phase 4; `/accessibility` statement placeholder until ticket 02.
