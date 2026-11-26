"use client";

import { SearchIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { matchesFaqQuery } from "@/lib/faq/search";

const SHORTCUTS = ["refund", "finalExam", "certificate", "password"] as const;

type Explorer = {
  query: string;
  setQuery: (query: string) => void;
  topic: string | null;
  setTopic: (topic: string) => void;
  matchCount: number | null;
};

const ExplorerContext = createContext<Explorer | null>(null);

function useExplorer(): Explorer {
  const value = useContext(ExplorerContext);
  if (!value) throw new Error("FaqExplorer is missing");
  return value;
}

/**
 * Shares the search text and the chosen topic between the hero search, the
 * topic tabs and the server-rendered list. The list is complete without
 * JavaScript; after hydration this hides what does not match the search (or,
 * with no search, what is not in the chosen topic) and opens a `#slug` link.
 */
export function FaqExplorer({
  firstTopic,
  children,
}: {
  firstTopic: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setTopic((current) => current ?? firstTopic),
    );
    return () => cancelAnimationFrame(id);
  }, [firstTopic]);

  // Show or hide items for the current search and topic.
  useEffect(() => {
    const searching = query.trim() !== "";
    let count = 0;
    for (const item of document.querySelectorAll<HTMLElement>(
      "[data-faq-item]",
    )) {
      item.hidden = !matchesFaqQuery(item.dataset.search ?? "", query);
      if (!item.hidden) count += 1;
    }
    for (const section of document.querySelectorAll<HTMLElement>(
      "[data-faq-category]",
    )) {
      const inTopic =
        searching || topic === null || section.dataset.faqCategory === topic;
      section.hidden =
        !inTopic || !section.querySelector("[data-faq-item]:not([hidden])");
    }
    const id = requestAnimationFrame(() =>
      setMatchCount(searching ? count : null),
    );
    return () => cancelAnimationFrame(id);
  }, [query, topic]);

  // Open the question named by the URL hash, whatever its topic.
  useEffect(() => {
    function open() {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const item = document.getElementById(id);
      if (!(item instanceof HTMLDetailsElement)) return;
      const section = item.closest<HTMLElement>("[data-faq-category]");
      if (section?.dataset.faqCategory) setTopic(section.dataset.faqCategory);
      setQuery("");
      requestAnimationFrame(() => {
        item.hidden = false;
        if (section) section.hidden = false;
        item.open = true;
        item.scrollIntoView({ block: "start" });
        item.querySelector("summary")?.focus({ preventScroll: true });
      });
    }
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const select = useCallback((next: string) => setTopic(next), []);
  const value = useMemo(
    () => ({ query, setQuery, topic, setTopic: select, matchCount }),
    [query, topic, select, matchCount],
  );
  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

/** The hero search form and popular chips. */
export function FaqSearchForm({ goLabel }: { goLabel: string }) {
  const t = useTranslations("Faq");
  const inputId = useId();
  const { query, setQuery } = useExplorer();
  return (
    <>
      <form
        className="tool-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          document.getElementById("faq-results")?.focus();
        }}
      >
        <label className="sr" htmlFor={inputId}>
          {t("searchLabel")}
        </label>
        <span className="sfx">
          <SearchIcon aria-hidden />
          <input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
          />
        </span>
        <button type="submit" className="btn btn-primary btn-lg tool-search-go">
          {goLabel}
        </button>
      </form>
      <div className="tool-pop" role="group" aria-label={t("popularLabel")}>
        <span>{t("popularLabel")}</span>
        {SHORTCUTS.map((key) => {
          const term = t(`shortcuts.${key}.term`);
          return (
            <button
              key={key}
              type="button"
              className="tool-chip"
              aria-pressed={query === term}
              onClick={() => setQuery(query === term ? "" : term)}
            >
              {t(`shortcuts.${key}.label`)}
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Topic tabs; each one shows its group of questions. */
export function FaqTopics({
  topics,
}: {
  topics: { key: string; label: string; count: number; art: ReactNode }[];
}) {
  const t = useTranslations("Faq");
  const { topic, setTopic } = useExplorer();
  const active = topic ?? topics[0]?.key;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = topics.findIndex((item) => item.key === active);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % topics.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index - 1 + topics.length) % topics.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = topics.length - 1;
    else return;
    event.preventDefault();
    setTopic(topics[next].key);
    document.getElementById(`fqtopic-${topics[next].key}`)?.focus();
  }

  return (
    <div
      className="topics"
      role="tablist"
      aria-label={t("categoriesLabel")}
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
    >
      {topics.map((item) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            id={`fqtopic-${item.key}`}
            type="button"
            role="tab"
            className="topic"
            aria-selected={selected}
            aria-controls={`faq-cat-${item.key}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => setTopic(item.key)}
          >
            <span className="topic-th" aria-hidden="true">
              {item.art}
            </span>
            <span className="topic-l">{item.label}</span>
            <span className="topic-n">{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Live count and the empty state, above the list. */
export function FaqStatus() {
  const t = useTranslations("Faq");
  const { matchCount } = useExplorer();
  return (
    <>
      <p
        id="faq-results"
        tabIndex={-1}
        aria-live="polite"
        className="fq-status"
        hidden={matchCount === null}
      >
        {matchCount === null ? "" : t("resultCount", { count: matchCount })}
      </p>
      {matchCount === 0 ? <p className="fq-none">{t("noResults")}</p> : null}
    </>
  );
}
