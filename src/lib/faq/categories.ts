/**
 * FAQ categories in display order. A check constraint on `faq_items.category`
 * holds the same list (migration `faq_categories`): keep them in sync.
 */
export const FAQ_CATEGORIES = [
  "about",
  "course",
  "exam",
  "certificates",
  "payments",
  "eligibility",
  "language",
  "ai",
  "classroom",
  "contact",
] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export function isFaqCategory(value: string): value is FaqCategory {
  return (FAQ_CATEGORIES as readonly string[]).includes(value);
}
