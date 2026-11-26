import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SiteFrame } from "@/components/layout/site-frame";
import { routing } from "@/i18n/routing";

/** The public site frame (ADR 0005). Site-wide, non-Admin things go here, not in the root layout. */
export default async function SiteLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return <SiteFrame locale={locale}>{children}</SiteFrame>;
}
