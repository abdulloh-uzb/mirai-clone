type CspOptions = {
  nonce: string;
  isDev: boolean;
  supabaseUrl: string;
  posthogHost: string;
  /** Full Sentry DSN, when set; only its origin is allowed in `connect-src`. */
  sentryDsn?: string;
};

export function createNonce(): string {
  return btoa(crypto.randomUUID());
}

function originOf(url: string | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
}

/** The Content-Security-Policy for one request. Scripts need the nonce. */
export function buildCsp({
  nonce,
  isDev,
  supabaseUrl,
  posthogHost,
  sentryDsn,
}: CspOptions): string {
  const sentry = originOf(sentryDsn);
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com ${posthogHost}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: ${supabaseUrl}`,
    `media-src 'self' blob: ${supabaseUrl}`,
    "font-src 'self' data:",
    `connect-src 'self' ${supabaseUrl} ${posthogHost}${sentry ? ` ${sentry}` : ""}${isDev ? " ws: http://127.0.0.1:54321" : ""}`,
    "frame-src https://js.stripe.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self' https://checkout.stripe.com",
  ].join("; ");
}
