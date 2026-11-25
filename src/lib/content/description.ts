import { stripMarkdown } from "@/lib/faq/search";

/**
 * A meta description from a Markdown body: plain text, whitespace collapsed,
 * cut at a word boundary to at most `max` characters with an ellipsis.
 */
export function describeMarkdown(markdown: string, max = 160): string {
  const text = stripMarkdown(markdown).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max / 2 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
