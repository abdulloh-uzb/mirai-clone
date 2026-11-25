import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { EligibilityCheck } from "@/components/eligibility/eligibility-check";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/eligibility">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Eligibility" });
  return pageMetadata({
    locale,
    path: "/eligibility",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function EligibilityPage({
  params,
}: PageProps<"/[locale]/eligibility">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Eligibility" });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-pretty text-muted-foreground">
        {t("intro")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{t("disclaimer")}</p>
      <div className="mt-8">
        <EligibilityCheck />
      </div>
    </div>
  );
}
