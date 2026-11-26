import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { FaqHash } from "@/components/faq/faq-hash";
import { FaqList } from "@/components/faq/faq-list";
import { FaqSearch } from "@/components/faq/faq-search";
import { PageHero, V2Root } from "@/components/layout/page-hero";
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

/** Picture beside each topic in the side list (files in public/reference/art). */
const TOPIC_ART: Record<(typeof FAQ_CATEGORIES)[number], string> = {
  about: "certificate",
  course: "lesson",
  exam: "exam",
  certificates: "filed",
  payments: "ticket",
  eligibility: "elig-moving",
  language: "signs",
  ai: "assistant",
  classroom: "finish",
  contact: "reviews",
};

export default async function FaqPage({ params }: PageProps<"/[locale]/faq">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Faq" });
  const entries = await listFaq(locale);
  const categoryCount = new Set(entries.map((e) => e.category)).size;

  return (
    <V2Root>
      <PageHero
        art="faq"
        title={t("title")}
        intro={t("count", {
          count: entries.length,
          categories: categoryCount,
        })}
      />
      <section className="fq-work">
        <div className="fq-work-in">
          <nav aria-label={t("categoriesLabel")} className="topics">
            {FAQ_CATEGORIES.map((category) => {
              const count = entries.filter(
                (e) => e.category === category,
              ).length;
              if (count === 0) return null;
              const art = TOPIC_ART[category];
              return (
                <a
                  key={category}
                  href={`#faq-cat-${category}`}
                  className="topic"
                >
                  <span className="topic-th" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="pic-day"
                      src={`/reference/art/${art}.webp`}
                      alt=""
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="pic-night"
                      src={`/reference/art/${art}-night.webp`}
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <span className="topic-l">{t(`categories.${category}`)}</span>
                  <span className="topic-n">{count}</span>
                </a>
              );
            })}
          </nav>
          <div className="fq-main">
            <FaqSearch>
              <FaqList entries={entries} />
            </FaqSearch>
          </div>
        </div>
      </section>
      <FaqHash />
      <JsonLd
        data={faqPage(
          entries.map((e) => ({
            question: e.title,
            answer: stripMarkdown(e.body),
          })),
        )}
      />
    </V2Root>
  );
}
