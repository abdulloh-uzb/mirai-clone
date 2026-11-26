import "server-only";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PrintButton } from "@/components/ref/ref-client";
import { routing, type Locale } from "@/i18n/routing";
import { describeMarkdown } from "@/lib/content/description";
import { getPage, type PageRow } from "@/lib/content/pages";
import type { TranslationResult } from "@/lib/content/translation";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import { Markdown } from "./markdown";
import { NotTranslatedNotice } from "./not-translated-notice";

/**
 * The layout of a `pages` row: title, a notice when it falls back to English,
 * the Markdown body, then anything the route adds (contact details, a form).
 */
export async function ContentPage({
  result,
  children,
  hero = false,
}: {
  result: TranslationResult<PageRow>;
  children?: ReactNode;
  /** Show the title in the shared page hero band instead of plain text. */
  hero?: boolean;
}) {
  const { item, isFallback } = result;
  const t = await getTranslations("Ref.legal");
  const tabs = [
    { slug: "privacy", label: t("tabs.privacy") },
    { slug: "terms", label: t("tabs.terms") },
    { slug: "refund-policy", label: t("tabs.refund-policy") },
    { slug: "school-rules", label: t("tabs.school-rules") },
    { slug: "accessibility", label: t("tabs.accessibility") },
  ] as const;
  const body = (
    <>
      {isFallback ? (
        <div className="mt-6">
          <NotTranslatedNotice />
        </div>
      ) : null}
      <div className="prose">
        <Markdown className="mt-2">{item.body}</Markdown>
      </div>
      {children}
    </>
  );
  if (!hero) {
    return (
      <article className="mx-auto w-full max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          {item.title}
        </h1>
        {body}
      </article>
    );
  }
  return (
    <V2Root className="lg-page">
      <PageHero title={item.title} art="courts">
        <p className="lg-kicker">{t("kicker")}</p>
        <p className="lg-meta">
          {t("updated", {
            date: new Intl.DateTimeFormat("en-US", {
              dateStyle: "long",
              timeZone: "UTC",
            }).format(new Date(item.updated_at)),
          })}
        </p>
        <div className="lg-acts">
          <Link className="btn btn-primary btn-lg" href="/contact">
            {t("contact")}
          </Link>
          <PrintButton className="btn btn-secondary btn-lg">
            {t("print")}
          </PrintButton>
        </div>
      </PageHero>
      <div className="lg-barwrap">
        <div className="lg-bar">
          <nav className="kit-tabs" aria-label={t("tabsLabel")}>
            {tabs.map((tab) => (
              <Link
                key={tab.slug}
                className="kit-tab"
                href={`/${tab.slug}`}
                aria-current={tab.slug === item.slug ? "page" : undefined}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <section className="rd">
        <div className="rd-in doc">
          <article className="rd-article">{body}</article>
        </div>
      </section>
    </V2Root>
  );
}

/**
 * Metadata for a `pages` row: hreflang only for languages that have a row,
 * and an English canonical when the page falls back (ADR 0004).
 */
export async function contentPageMetadata(
  slug: string,
  locale: Locale,
  path: string,
): Promise<Metadata> {
  const result = await getPage(slug, locale);
  if (!result) return {};
  return pageMetadata({
    locale,
    path,
    title: result.item.title,
    description: describeMarkdown(result.item.body),
    availableLocales: result.availableLocales,
    isFallback: result.isFallback,
  });
}

type LocaleParams = { params: Promise<{ locale: string }> };

/**
 * The metadata and page of a route that only shows one `pages` row, such as
 * `/terms`. An unknown language or an unpublished row gives the 404 page.
 */
export function contentRoute(slug: string) {
  const path = `/${slug}`;
  return {
    async generateMetadata({ params }: LocaleParams): Promise<Metadata> {
      const { locale } = await params;
      if (!hasLocale(routing.locales, locale)) return {};
      return contentPageMetadata(slug, locale, path);
    },
    async Page({ params }: LocaleParams) {
      const { locale } = await params;
      if (!hasLocale(routing.locales, locale)) notFound();
      const result = await getPage(slug, locale);
      if (!result) notFound();
      return <ContentPage result={result} hero />;
    },
  };
}
