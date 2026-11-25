import { hasLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    ...pageMetadata({
      locale,
      path: "/",
      title: t("title", { name: siteConfig.name }),
      description: t("description"),
    }),
    // The home page title is the full site title, without the layout template.
    title: { absolute: t("title", { name: siteConfig.name }) },
  };
}

// Placeholder home page. The real home page is built in phase 2, ticket 09.
export default function HomePage() {
  const t = useTranslations("Home");

  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-6 text-lg text-pretty text-muted-foreground">
        {t("intro")}
      </p>
    </section>
  );
}
