import * as Sentry from "@sentry/nextjs";
import { parseConsent } from "@/lib/privacy/consent";

// Browser errors only: no replay, no tracing, no PII, and only after the
// visitor accepted analytics (a choice made later applies on the next load).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn && parseConsent(document.cookie) === "analytics") {
  Sentry.init({ dsn, tracesSampleRate: 0 });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
