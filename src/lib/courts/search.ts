import type { CountySummary } from "./types";

/** Lower-case and strip accents so "Bérnardino" matches "bernardino". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * True when the query is a substring of the County name, its county-seat city,
 * or any Courthouse name or court code. An empty query matches everything.
 */
export function matchesCountyQuery(
  county: CountySummary,
  query: string,
): boolean {
  const needle = normalize(query);
  if (!needle) return true;
  const haystack = [
    county.name,
    county.seatCity,
    ...county.courthouses.flatMap((c) => [c.name, c.city, c.courtCode]),
  ];
  return haystack.some((text) => text && normalize(text).includes(needle));
}
