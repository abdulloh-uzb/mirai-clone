import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/routing";
import { localizedUrl } from "./metadata";

// Builders for schema.org structured data. Ticket 09 adds
// educationalOrganization here.

/** `answer` is plain text (Markdown already stripped). */
export function faqPage(entries: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: entry.answer },
    })),
  };
}

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

export type CourseInput = {
  siteUrl: string;
  locale: Locale;
  name: string;
  description: string;
  /** Unprefixed path of the page that sells the course. */
  path: string;
  priceCents: number;
  providerName: string;
  /** The languages the course is taught in. */
  languages: readonly string[];
};

/** `Course` with an `offers` price from the database (never hard-coded). */
export function course(input: CourseInput) {
  const url = localizedUrl(input.siteUrl, input.locale, input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url,
    inLanguage: [...input.languages],
    provider: { "@type": "Organization", name: input.providerName },
    offers: {
      "@type": "Offer",
      url,
      price: (input.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };
}
