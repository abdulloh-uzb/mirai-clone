"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CONSENT_OPEN_EVENT,
  parseConsent,
  serializeConsent,
  type Consent,
} from "@/lib/privacy/consent";

let loaded = false;

/** Loads PostHog only after consent and only when a key is set. No PII is sent. */
type Analytics = { posthogKey?: string; posthogHost: string };

async function startAnalytics({ posthogKey, posthogHost }: Analytics) {
  if (!posthogKey || loaded) return;
  loaded = true;
  const { default: posthog } = await import("posthog-js");
  posthog.init(posthogKey, {
    api_host: posthogHost,
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: "history_change",
    mask_all_text: true,
    mask_all_element_attributes: true,
    disable_session_recording: true,
  });
}

/**
 * Cookie banner. Analytics stay off until "Accept analytics"; "Decline" is
 * equally prominent. The footer's "Privacy choices" button reopens it.
 */
// The keys come from the server (lib/env), so the zod env schema stays out of the browser bundle.
export function CookieConsent({ posthogKey, posthogHost }: Analytics) {
  const t = useTranslations("Consent");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = parseConsent(document.cookie);
    if (current === "analytics")
      void startAnalytics({ posthogKey, posthogHost });
    // Deferred: the cookie is only readable in the browser.
    const timer = setTimeout(() => {
      if (current === null) setOpen(true);
    }, 0);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
    };
  }, [posthogKey, posthogHost]);

  function choose(value: Consent) {
    document.cookie = serializeConsent(value);
    setOpen(false);
    if (value === "analytics") void startAnalytics({ posthogKey, posthogHost });
  }

  if (!open) return null;
  return (
    <div
      role="region"
      aria-label={t("title")}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border bg-background p-4 shadow-lg sm:flex-row sm:items-center"
    >
      <div className="flex-1 text-sm">
        <p className="font-semibold">{t("title")}</p>
        <p className="text-muted-foreground">{t("body")}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => choose("none")}>
          {t("decline")}
        </Button>
        <Button variant="outline" onClick={() => choose("analytics")}>
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}

export function PrivacyChoicesButton({ className }: { className?: string }) {
  const t = useTranslations("Consent");
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
    >
      {t("choices")}
    </button>
  );
}
