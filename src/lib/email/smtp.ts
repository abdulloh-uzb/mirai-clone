import "server-only";
import nodemailer from "nodemailer";
import type { EmailMessage, EmailSender } from "./types";

export type SmtpSettings = {
  host: string;
  port: number;
  user?: string;
  password?: string;
};

/** Any SMTP server (Gmail app password, Mailgun, Brevo, Resend SMTP, ...). */
export function createSmtpSender(
  settings: SmtpSettings,
  from: string,
): EmailSender {
  const transport = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    // 465 is implicit TLS; 587 and 25 upgrade with STARTTLS.
    secure: settings.port === 465,
    auth: settings.user
      ? { user: settings.user, pass: settings.password ?? "" }
      : undefined,
  });

  return {
    async send({ to, subject, text, replyTo }: EmailMessage) {
      await transport.sendMail({ from, to, subject, text, replyTo });
    },
  };
}
