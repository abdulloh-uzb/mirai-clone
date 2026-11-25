import "server-only";
import { siteConfig } from "@/config/site";
import { emailEnv } from "./env";
import { createMailpitSender } from "./mailpit";
import { createResendSender } from "./resend";
import type { EmailSender } from "./types";

export type { EmailMessage, EmailSender } from "./types";

/** `noreply@` on the domain of the school's contact address. */
function fromAddress(): string {
  const domain = siteConfig.contact.email.split("@")[1];
  return `noreply@${domain}`;
}

/** Resend when `RESEND_API_KEY` is set, else the local Mailpit mail catcher. */
export function getEmailSender(): EmailSender {
  const { resendApiKey, mailpitUrl } = emailEnv();
  return resendApiKey
    ? createResendSender(resendApiKey, fromAddress())
    : createMailpitSender(mailpitUrl, fromAddress());
}
