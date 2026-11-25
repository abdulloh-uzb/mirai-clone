/** Server-only email settings, read at call time. Resend when a key is set, else local Mailpit. */
export function emailEnv() {
  return {
    resendApiKey: process.env.RESEND_API_KEY || undefined,
    mailpitUrl: process.env.MAILPIT_URL || "http://127.0.0.1:54324",
  };
}
