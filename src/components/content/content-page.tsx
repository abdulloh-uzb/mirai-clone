import "server-only";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { describeMarkdown } from "@/lib/content/description";
import { getPage, type PageRow } from "@/lib/content/pages";
import type { TranslationResult } from "@/lib/content/translation";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { Markdown } from "./markdown";
import { NotTranslatedNotice } from "./not-translated-notice";

/**
 * The layout of a `pages` row: title, a notice when it falls back to English,
 * the Markdown body, then anything the route adds (contact details, a form).
 */
export function ContentPage({
  result,
  children,
}: {
  result: TranslationResult<PageRow>;
  children?: ReactNode;
}) {
  const { item, isFallback } = result;
  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        {item.title}
      </h1>
      {isFallback ? (
        <div className="mt-6">
          <NotTranslatedNotice />
        </div>
      ) : null}
      <Markdown className="mt-2">{item.body}</Markdown>
      {children}
    </article>
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
      return <ContentPage result={result} />;
    },
  };
}
