import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { LanguageSuggestion } from "@/components/layout/language-suggestion";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/skip-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { VerifyEmailBanner } from "@/components/layout/verify-email-banner";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { isSiteIndexable, publicEnv } from "@/lib/env";
import "../globals.css";

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

  return (
    <html lang={locale} suppressHydrationWarning className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>
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
            <SiteFooter />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
