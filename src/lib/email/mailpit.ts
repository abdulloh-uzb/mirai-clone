import "server-only";
import type { EmailMessage, EmailSender } from "./types";

// TODO(spec): spec says SMTP; local Mailpit is reached over its HTTP send API
// because the local Supabase stack does not expose Mailpit's SMTP port.
export function createMailpitSender(
  baseUrl: string,
  from: string,
): EmailSender {
  return {
    async send({ to, subject, text, replyTo }: EmailMessage) {
      const res = await fetch(`${baseUrl}/api/v1/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          From: { Email: from },
          To: [{ Email: to }],
          ReplyTo: replyTo ? [{ Email: replyTo }] : undefined,
          Subject: subject,
          Text: text,
        }),
      });
      if (!res.ok) throw new Error(`Mailpit send failed: ${res.status}`);
    },
  };
}
