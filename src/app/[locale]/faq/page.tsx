import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FaqHash } from "@/components/faq/faq-hash";
import { FaqList } from "@/components/faq/faq-list";
import { FaqSearch } from "@/components/faq/faq-search";
import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { FAQ_CATEGORIES } from "@/lib/faq/categories";
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
    <>
      <PageHero
        title={t("title")}
        intro={t("count", {
          count: entries.length,
          categories: categoryCount,
        })}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[16rem_1fr]">
        <nav
          aria-label={t("categoriesLabel")}
          className="lg:sticky lg:top-28 lg:self-start"
        >
          <ul className="flex flex-wrap gap-2 lg:grid">
            {FAQ_CATEGORIES.map((category) => {
              const count = entries.filter(
                (e) => e.category === category,
              ).length;
              if (count === 0) return null;
              return (
                <li key={category}>
                  <a
                    href={`#faq-cat-${category}`}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-full border-2 bg-card px-4 text-sm font-semibold hover:border-brand-green focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    {t(`categories.${category}`)}
                    <span className="rounded-full bg-surface-mint px-2 py-0.5 text-xs">
                      {count}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div>
          <FaqSearch>
            <FaqList entries={entries} />
          </FaqSearch>
        </div>
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
    </>
  );
}
