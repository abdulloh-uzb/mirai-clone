import "server-only";
import { siteConfig } from "@/config/site";
import { emailEnv } from "./env";
import { createMailpitSender } from "./mailpit";
import { createResendSender } from "./resend";
import { createSmtpSender } from "./smtp";
import type { EmailSender } from "./types";

export type { EmailMessage, EmailSender } from "./types";

/** `noreply@` on the domain of the school's contact address. */
function fromAddress(): string {
  const domain = siteConfig.contact.email.split("@")[1];
  return `noreply@${domain}`;
}

/**
 * Resend when `RESEND_API_KEY` is set, else SMTP when `SMTP_HOST` is set,
 * else the local Mailpit mail catcher.
 */
export function getEmailSender(): EmailSender {
  const { resendApiKey, smtp, from, mailpitUrl } = emailEnv();
  const sender = from ?? fromAddress();
  if (resendApiKey) return createResendSender(resendApiKey, sender);
  if (smtp) return createSmtpSender(smtp, sender);
  return createMailpitSender(mailpitUrl, sender);
}
