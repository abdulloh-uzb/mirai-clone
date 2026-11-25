import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ContentPage,
  contentPageMetadata,
} from "@/components/content/content-page";
import { AdaRequestForm } from "@/components/support/ada-request-form";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getPage } from "@/lib/content/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/accessibility">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return contentPageMetadata("accessibility", locale, "/accessibility");
}

/** The accessibility statement (a `pages` row), then the ADA request form. */
export default async function AccessibilityPage({
  params,
}: PageProps<"/[locale]/accessibility">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [result, t, account] = await Promise.all([
    getPage("accessibility", locale),
    getTranslations({ locale, namespace: "Accessibility" }),
    getCurrentAccount(),
  ]);
  if (!result) notFound();

  return (
    <ContentPage result={result}>
      <h2 className="mt-10 text-xl font-semibold">{t("formHeading")}</h2>
      <div className="mt-4">
        <AdaRequestForm accountEmail={account?.email} />
      </div>
    </ContentPage>
  );
}
