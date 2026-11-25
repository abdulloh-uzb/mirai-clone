import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FaqHash } from "@/components/faq/faq-hash";
import { FaqList } from "@/components/faq/faq-list";
import { FaqSearch } from "@/components/faq/faq-search";
import { JsonLd } from "@/components/seo/json-ld";
import { routing } from "@/i18n/routing";
import { listFaq } from "@/lib/faq/faq";
import { stripMarkdown } from "@/lib/faq/search";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { faqPage } from "@/lib/seo/json-ld";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/faq">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Faq" });
  return pageMetadata({
    locale,
    path: "/faq",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Faq" });
  const entries = await listFaq(locale);
  const categoryCount = new Set(entries.map((e) => e.category)).size;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {t("count", { count: entries.length, categories: categoryCount })}
      </p>
      <div className="mt-8">
        <FaqSearch>
          <FaqList entries={entries} />
        </FaqSearch>
      </div>
      <FaqHash />
      <JsonLd
        data={faqPage(
          entries.map((e) => ({
            question: e.title,
            answer: stripMarkdown(e.body),
          })),
        )}
      />
    </div>
  );
}
