/** Lower-cases and removes accents so "Cómo" and "como" match. */
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain text of a Markdown string: no link targets, emphasis marks or list bullets. */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]/g, "");
}

/** The text a FAQ item is searched on: title and body, folded. */
export function faqSearchText(entry: { title: string; body: string }): string {
  return fold(`${entry.title} ${stripMarkdown(entry.body)}`);
}

/** True when every word of `query` appears in `searchText`. An empty query matches. */
export function matchesFaqQuery(searchText: string, query: string): boolean {
  const words = fold(query).split(" ").filter(Boolean);
  return words.every((word) => searchText.includes(word));
}
