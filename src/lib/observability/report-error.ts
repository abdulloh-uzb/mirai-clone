import * as Sentry from "@sentry/nextjs";

/**
 * One place for caught server errors (webhook, cron and AI routes). Also sent
 * to Sentry when `SENTRY_DSN` is set.
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
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { tags: { context }, extra });
  }
}
