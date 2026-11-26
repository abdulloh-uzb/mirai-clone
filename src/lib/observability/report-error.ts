/**
 * One place for caught server errors (webhook, cron and AI routes).
 * TODO(spec): forward to Sentry when `SENTRY_DSN` is set; the SDK is skipped
 * for now to keep the bundle small.
 */
export function reportError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  console.error(
    `[error] ${context}`,
    error instanceof Error ? error.message : error,
    extra ?? "",
  );
}
