import type { Locale } from "@/i18n/routing";
import { localizedUrl } from "./metadata";

// Builders for schema.org structured data. Later tickets add faqPage, article,
// course and educationalOrganization here.

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
