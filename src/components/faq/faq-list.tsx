import { ChevronDownIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Markdown } from "@/components/content/markdown";
import { NotTranslatedNotice } from "@/components/content/not-translated-notice";
import type { FaqEntry } from "@/lib/faq/faq";
import { FAQ_CATEGORIES } from "@/lib/faq/categories";
import { faqSearchText } from "@/lib/faq/search";

/**
 * Every question, grouped by category, as native `<details>` (works without
 * JavaScript and by keyboard). `data-search` is what the search box filters on.
 */
export async function FaqList({ entries }: { entries: FaqEntry[] }) {
  const t = await getTranslations("Faq");
  return (
    <div className="mt-6 grid gap-10">
      {FAQ_CATEGORIES.map((category) => {
        const items = entries.filter((e) => e.category === category);
        if (items.length === 0) return null;
        return (
          <section
            key={category}
            className="fq-group"
            data-faq-category
            aria-labelledby={`faq-cat-${category}`}
          >
            <h2 id={`faq-cat-${category}`} className="fq-gh scroll-mt-28">
              {t(`categories.${category}`)}
            </h2>
            <div className="v2-acc faq mt-4">
              {items.map((entry) => (
                <details
                  key={entry.slug}
                  id={entry.slug}
                  data-faq-item
                  data-search={faqSearchText(entry)}
                  className="v2-acc-i group scroll-mt-28"
                >
                  <summary className="v2-acc-q marker:content-none [&::-webkit-details-marker]:hidden">
                    {entry.title}
                    <ChevronDownIcon
                      aria-hidden
                      className="size-5 shrink-0 transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <div className="v2-acc-a">
                    <div>
                      {entry.isFallback ? <NotTranslatedNotice /> : null}
                      <Markdown className="[&>*:first-child]:mt-0">
                        {entry.body}
                      </Markdown>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
