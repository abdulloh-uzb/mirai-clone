import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { LmsRoot } from "@/components/layout/lms-page";
import { PortalNav } from "@/components/portal/portal-nav";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { signInPathFor } from "@/lib/auth/return-path";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Every Portal page needs a signed-in user. The proxy already sends Visitors
 * to sign in with the exact return path; this server check backs it up.
 */
export default async function PortalLayout({
  children,
  params,
}: LayoutProps<"/[locale]/portal">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const account = await getCurrentAccount();
  if (!account) {
    redirect(signInPathFor(getPathname({ href: "/portal", locale })));
  }
  return (
    <LmsRoot>
      <PortalNav />
      {children}
    </LmsRoot>
  );
}
