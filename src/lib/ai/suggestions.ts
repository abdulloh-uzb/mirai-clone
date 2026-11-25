export type SuggestionKey =
  | "home"
  | "courses"
  | "court"
  | "faq"
  | "portal"
  | "status"
  | "orders"
  | "default";

// Number of texts per page kind: messages `Assistant.suggestions.<key>.<n>`.
const COUNTS: Record<SuggestionKey, number> = {
  home: 4,
  courses: 3,
  court: 3,
  faq: 3,
  portal: 4,
  status: 3,
  orders: 3,
  default: 3,
};

/** Which suggestion set fits a pathname (with or without a locale prefix). */
export function suggestionKeyFor(pathname: string): SuggestionKey {
  const path = pathname.replace(/^\/(ja|es|ru)(?=\/|$)/, "") || "/";
  if (path === "/") return "home";
  if (path.startsWith("/courses")) return "courses";
  if (path.startsWith("/courts/")) return "court";
  if (path.startsWith("/faq")) return "faq";
  if (path.startsWith("/portal/status")) return "status";
  if (path.startsWith("/portal/orders")) return "orders";
  if (path.startsWith("/portal")) return "portal";
  return "default";
}

export function suggestionsFor(pathname: string): {
  key: SuggestionKey;
  ids: number[];
} {
  const key = suggestionKeyFor(pathname);
  return { key, ids: Array.from({ length: COUNTS[key] }, (_, i) => i) };
}
