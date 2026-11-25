import "server-only";
import type { EmailMessage, EmailSender } from "./types";

export function createResendSender(apiKey: string, from: string): EmailSender {
  return {
    async send({ to, subject, text, replyTo }: EmailMessage) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          text,
          reply_to: replyTo,
        }),
      });
      if (!res.ok) throw new Error(`Resend send failed: ${res.status}`);
    },
  };
}
