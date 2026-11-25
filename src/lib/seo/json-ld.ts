import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { localizedUrl } from "./metadata";

export type ArticleInput = {
  siteUrl: string;
  locale: Locale;
  /** The path without a language prefix. */
  path: string;
  title: string;
  description: string;
  /** Site-relative or absolute image. */
  image: string;
  datePublished: string;
  dateModified: string;
};

export function article(input: ArticleInput) {
  const base = input.siteUrl.replace(/\/+$/, "");
  const image = /^https?:\/\//.test(input.image)
    ? input.image
    : `${base}${input.image}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    inLanguage: input.locale,
    mainEntityOfPage: localizedUrl(input.siteUrl, input.locale, input.path),
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}

// Builders for schema.org structured data. Later tickets add faqPage, article,
// course and educationalOrganization here.

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbList(
  siteUrl: string,
  locale: Locale,
  items: BreadcrumbItem[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(siteUrl, locale, item.path),
    })),
  };
}
