/** Lower-case and strip accents so "renovación" matches "renovacion". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * True when the query is a substring of the tile title or its keywords.
 * An empty query matches everything.
 */
export function matchesTile(
  tile: { title: string; keywords: string },
  query: string,
): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  return [tile.title, tile.keywords].some((text) =>
    normalize(text).includes(needle),
  );
}
