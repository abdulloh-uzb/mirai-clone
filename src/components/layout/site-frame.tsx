import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { LazyAssistantPanel } from "@/components/ai/lazy-assistant-panel";
import { CookieConsent } from "@/components/privacy/cookie-consent";
import { HelpWidget } from "@/components/layout/help-widget";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { LanguageSuggestion } from "@/components/layout/language-suggestion";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/skip-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { VerifyEmailBanner } from "@/components/layout/verify-email-banner";
import type { Locale } from "@/i18n/routing";
import { publicEnv } from "@/lib/env";

/** The public page frame: header, footer and floating widgets (ADR 0005). */
export async function SiteFrame({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const helpT = await getTranslations({ locale, namespace: "HelpWidget" });

  return (
    <>
      <SkipLink />
      <LanguageSuggestion />
      <AnnouncementBar locale={locale} />
      <SiteHeader />
      <VerifyEmailBanner />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      {/* Suspense boundaries let React hydrate the footer and floating
          widgets in separate, later tasks instead of one long one. */}
      <Suspense>
        <SiteFooter />
      </Suspense>
      <Suspense>
        <HelpWidget collapsedLabel={helpT("collapsedLabel")} />
      </Suspense>
      <Suspense>
        <LazyAssistantPanel />
      </Suspense>
      <Suspense>
        <CookieConsent
          posthogKey={publicEnv.NEXT_PUBLIC_POSTHOG_KEY}
          posthogHost={publicEnv.NEXT_PUBLIC_POSTHOG_HOST}
        />
      </Suspense>
    </>
  );
}
