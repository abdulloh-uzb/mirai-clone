import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  FaqExplorer,
  FaqSearchForm,
  FaqStatus,
  FaqTopics,
} from "@/components/faq/faq-explorer";
import { OpenAssistantButton } from "@/components/ref/ref-client";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { FaqList } from "@/components/faq/faq-list";
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

  const tr = await getTranslations({ locale, namespace: "Ref.faq" });
  const topics = FAQ_CATEGORIES.flatMap((category) => {
    const count = entries.filter((e) => e.category === category).length;
    if (count === 0) return [];
    const art = TOPIC_ART[category];
    return [
      {
        key: category,
        label: t(`categories.${category}`),
        count,
        art: (
          <>
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
          </>
        ),
      },
    ];
  });

  return (
    <V2Root>
      <FaqExplorer firstTopic={topics[0].key}>
        <PageHero
          art="faq"
          title={t("title")}
          intro={t("count", {
            count: entries.length,
            categories: categoryCount,
          })}
        >
          <FaqSearchForm goLabel={tr("searchGo")} />
        </PageHero>
        <section className="fq-work">
          <div className="fq-work-in">
            <FaqTopics topics={topics} />
            <div className="fq-main" tabIndex={-1}>
              <FaqStatus />
              <FaqList entries={entries} />
              <div className="fq-help">
                <strong>{tr("didntFind")}</strong>
                <a
                  className="btn btn-primary"
                  href={siteConfig.contact.phoneHref}
                >
                  <span>{tr("call", { phone: siteConfig.contact.phone })}</span>
                </a>
                <Link className="btn btn-secondary" href="/contact">
                  {tr("write")}
                </Link>
                <OpenAssistantButton
                  className="btn btn-ghost"
                  label={tr("askAi")}
                >
                  {tr("askAi")}
                </OpenAssistantButton>
              </div>
            </div>
          </div>
        </section>
      </FaqExplorer>
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
