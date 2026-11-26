/**
 * Server-only email settings, read at call time.
 * Resend when a key is set, else SMTP when a host is set, else local Mailpit.
 */
export function emailEnv() {
  const smtpHost = process.env.SMTP_HOST || undefined;
  return {
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    smtp: smtpHost
      ? {
          host: smtpHost,
          port: Number(process.env.SMTP_PORT || 587),
          user: process.env.SMTP_USER || undefined,
          password: process.env.SMTP_PASSWORD || undefined,
        }
      : undefined,
    /** Sender address; defaults to noreply@ on the contact email's domain. */
    from: process.env.EMAIL_FROM || undefined,
    mailpitUrl: process.env.MAILPIT_URL || "http://127.0.0.1:54324",
  };
}
