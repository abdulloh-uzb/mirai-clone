import { parseConsent } from "@/lib/privacy/consent";

// Browser errors only: no replay, no tracing, no PII, and only after the
// visitor accepted analytics (a choice made later applies on the next load).
// The Sentry SDK is large, so it is loaded only when it will be used.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

type SentryModule = typeof import("@sentry/nextjs");
let sentry: SentryModule | undefined;

if (dsn && parseConsent(document.cookie) === "analytics") {
  window.addEventListener("load", () => {
    void import("@sentry/nextjs").then((module) => {
      module.init({ dsn, tracesSampleRate: 0 });
      sentry = module;
    });
  });
}

export const onRouterTransitionStart: SentryModule["captureRouterTransitionStart"] =
  (...args) => sentry?.captureRouterTransitionStart(...args);
