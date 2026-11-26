import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/layout/theme-provider";
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
          attribute={["class", "data-theme"]}
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={clientMessages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
