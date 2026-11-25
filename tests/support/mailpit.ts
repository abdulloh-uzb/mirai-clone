import { testEnv } from "./env";

// Reads auth emails caught by Mailpit, the local mail catcher that ships with
// the Supabase stack. Searches by recipient, so parallel tests that use unique
// emails never see each other's mail.

export type CaughtEmail = {
  ID: string;
  Subject: string;
  HTML: string;
  Text: string;
};

type SearchResult = { messages: { ID: string; Subject: string }[] };

const api = (path: string) => `${testEnv.MAILPIT_URL}/api/v1${path}`;
const toQuery = (to: string) => encodeURIComponent(`to:"${to}"`);

/**
 * Waits for an email to `to`, optionally with a subject matching `subject`.
 * Pass `after` to ignore emails that were already there (for a resend).
 */
export async function waitForEmail(
  to: string,
  options: { subject?: RegExp; after?: string[]; timeoutMs?: number } = {},
): Promise<CaughtEmail> {
  const { subject, after = [], timeoutMs = 15_000 } = options;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(api(`/search?query=${toQuery(to)}&limit=20`));
    const { messages } = (await res.json()) as SearchResult;
    const hit = messages.find(
      (m) => !after.includes(m.ID) && (!subject || subject.test(m.Subject)),
    );
    if (hit) {
      const full = await fetch(api(`/message/${hit.ID}`));
      return (await full.json()) as CaughtEmail;
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`no email to ${to} within ${timeoutMs} ms`);
}

/** IDs of every email to `to` caught so far. */
export async function emailIdsTo(to: string): Promise<string[]> {
  const res = await fetch(api(`/search?query=${toQuery(to)}&limit=50`));
  const { messages } = (await res.json()) as SearchResult;
  return messages.map((m) => m.ID);
}

/** The first link in an email body, with HTML entities decoded. */
export function firstLink(email: CaughtEmail): string {
  const href = /href="([^"]+)"/.exec(email.HTML)?.[1];
  if (!href) throw new Error(`no link in email "${email.Subject}"`);
  return href.replaceAll("&amp;", "&");
}

/** Deletes every email to `to`. */
export async function deleteEmailsTo(to: string): Promise<void> {
  await fetch(api(`/search?query=${toQuery(to)}`), { method: "DELETE" });
}
