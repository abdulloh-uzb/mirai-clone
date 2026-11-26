import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LazyAssistantPanel } from "@/components/ai/lazy-assistant-panel";
import { CookieConsent } from "@/components/privacy/cookie-consent";
import { HelpWidget } from "@/components/layout/help-widget";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { LanguageSuggestion } from "@/components/layout/language-suggestion";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/skip-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { VerifyEmailBanner } from "@/components/layout/verify-email-banner";
import { siteConfig } from "@/config/site";
import { CLIENT_NAMESPACES, pickNamespaces } from "@/i18n/client-messages";
import type { Messages } from "@/i18n/fallback";
import { routing } from "@/i18n/routing";
import { isSiteIndexable, publicEnv } from "@/lib/env";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});
const notoJp = Noto_Sans_JP({
  display: "swap",
  variable: "--font-noto-jp",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title", { name: siteConfig.name });
  const indexable = isSiteIndexable();
  // Defaults for every page; public pages refine these with `pageMetadata`.
  return {
    metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
    title: { default: title, template: `%s · ${title}` },
    description: t("description"),
    robots: { index: indexable, follow: indexable },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Set by the proxy; makes every page dynamic, which a nonce needs.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const helpT = await getTranslations({ locale, namespace: "HelpWidget" });

  // Only what client components read goes to the browser.
  const clientMessages = pickNamespaces(
    (await getMessages()) as Messages,
    CLIENT_NAMESPACES,
  );

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`h-full ${inter.variable} ${notoJp.variable}`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider
          nonce={nonce}
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={clientMessages}>
            <SkipLink />
            <LanguageSuggestion />
            <AnnouncementBar locale={locale} />
            <SiteHeader />
            <VerifyEmailBanner />
            <main
              id={MAIN_CONTENT_ID}
              tabIndex={-1}
              className="flex-1 outline-none"
            >
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
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
