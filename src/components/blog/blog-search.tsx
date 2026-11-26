"use client";

import { SearchIcon } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";

const SearchContext = createContext<{
  query: string;
  setQuery: (query: string) => void;
} | null>(null);

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Shares the search text between the hero search box and the post list. The
 * list is complete without JavaScript; after hydration this hides rows
 * (`[data-post]`) that do not contain every typed word.
 */
export function BlogSearch({
  noResults,
  children,
}: {
  noResults: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const words = fold(query).split(" ").filter(Boolean);
    let count = 0;
    for (const row of document.querySelectorAll<HTMLElement>("[data-post]")) {
      const text = fold(row.textContent ?? "");
      row.hidden = !words.every((word) => text.includes(word));
      if (!row.hidden) count += 1;
    }
    const id = requestAnimationFrame(() =>
      setShown(words.length ? count : null),
    );
    return () => cancelAnimationFrame(id);
  }, [query]);

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
      <p
        className="bg-none"
        aria-live="polite"
        hidden={shown !== 0}
        style={{ textAlign: "center", padding: "24px" }}
      >
        {shown === 0 ? noResults : ""}
      </p>
    </SearchContext.Provider>
  );
}

/** The hero search form. */
export function BlogSearchForm({
  label,
  goLabel,
}: {
  label: string;
  goLabel: string;
}) {
  const context = useContext(SearchContext);
  const inputId = useId();
  if (!context) throw new Error("BlogSearch is missing");
  return (
    <form
      className="tool-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        document.getElementById("blog-posts")?.scrollIntoView();
      }}
    >
      <label className="sr" htmlFor={inputId}>
        {label}
      </label>
      <span className="sfx">
        <SearchIcon aria-hidden />
        <input
          id={inputId}
          type="search"
          value={context.query}
          onChange={(event) => context.setQuery(event.target.value)}
          placeholder={label}
          autoComplete="off"
        />
      </span>
      <button type="submit" className="btn btn-primary btn-lg tool-search-go">
        {goLabel}
      </button>
    </form>
  );
}
