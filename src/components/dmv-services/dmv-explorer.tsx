"use client";

import { ExternalLinkIcon, SearchIcon } from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { matchesTile } from "@/lib/dmv-services/search";

type Tile = { id: string; title: string; keywords: string };

type Explorer = {
  query: string;
  setQuery: (query: string) => void;
  group: string;
  setGroup: (group: string) => void;
  situation: string;
  setSituation: (situation: string) => void;
  visibleCount: number;
};

const ExplorerContext = createContext<Explorer | null>(null);

function useExplorer(): Explorer {
  const value = useContext(ExplorerContext);
  if (!value) throw new Error("DmvExplorer is missing");
  return value;
}

/** Roving-tabindex arrow keys for a list of tabs; returns the next index. */
function nextIndex(event: KeyboardEvent, index: number, length: number) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown")
    return (index + 1) % length;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp")
    return (index - 1 + length) % length;
  if (event.key === "Home") return 0;
  if (event.key === "End") return length - 1;
  return null;
}

/**
 * Shares the search text, the chosen situation and the chosen service group.
 * The groups of `[data-tile]` rows are server-rendered; this hides what does
 * not match the search (or, with no search, what is not in the chosen group).
 */
export function DmvExplorer({
  tiles,
  firstGroup,
  firstSituation,
  children,
}: {
  tiles: Tile[];
  firstGroup: string;
  firstSituation: string;
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(firstGroup);
  const [situation, setSituation] = useState(firstSituation);
  const [enhanced, setEnhanced] = useState(false);
  const visibleCount = tiles.filter((tile) => matchesTile(tile, query)).length;

  useEffect(() => {
    const id = requestAnimationFrame(() => setEnhanced(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!enhanced) return;
    const searching = query.trim() !== "";
    for (const section of document.querySelectorAll<HTMLElement>(
      "[data-group]",
    )) {
      let anyVisible = false;
      for (const el of section.querySelectorAll<HTMLElement>("[data-tile]")) {
        const tile = tiles.find((x) => x.id === el.dataset.tile);
        const show = !tile || matchesTile(tile, query);
        el.hidden = !show;
        if (show) anyVisible = true;
      }
      section.hidden = searching
        ? !anyVisible
        : section.dataset.group !== group;
    }
  }, [enhanced, query, group, tiles]);

  const value = useMemo(
    () => ({
      query,
      setQuery,
      group,
      setGroup,
      situation,
      setSituation,
      visibleCount,
    }),
    [query, group, situation, visibleCount],
  );
  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

/** The hero search form. */
export function DmvSearchForm({ goLabel }: { goLabel: string }) {
  const t = useTranslations("DmvServices");
  const inputId = useId();
  const { query, setQuery } = useExplorer();
  return (
    <form
      className="tool-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        document.getElementById("dmAllH")?.scrollIntoView();
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
  );
}

export type Situation = {
  id: string;
  art: string;
  title: string;
  description: string;
  tiles: { id: string; title: string; url: string }[];
};

/** "What's happening?": six situations, each with a short list of official links. */
export function DmvSituations({
  situations,
  heading,
  label,
  hostLabel,
  newTab,
}: {
  situations: Situation[];
  heading: string;
  label: string;
  hostLabel: string;
  newTab: string;
}) {
  const { situation, setSituation } = useExplorer();
  const active = situations.find((s) => s.id === situation) ?? situations[0];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = situations.findIndex((s) => s.id === active.id);
    const next = nextIndex(event, index, situations.length);
    if (next === null) return;
    event.preventDefault();
    setSituation(situations[next].id);
    document.getElementById(`dmT-${situations[next].id}`)?.focus();
  }

  return (
    <section className="dm-sits" aria-labelledby="dmSitH">
      <div className="dm-in">
        <h2 id="dmSitH" className="dm-h">
          {heading}
        </h2>
        <div
          className="dm-grid"
          role="tablist"
          aria-label={label}
          onKeyDown={onKeyDown}
        >
          {situations.map((item) => {
            const selected = item.id === active.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`dmT-${item.id}`}
                className="dm-sit"
                aria-selected={selected}
                aria-controls="dmPanel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setSituation(item.id)}
              >
                <span className="dm-pic">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="pic-day"
                    src={`/reference/art/${item.art}.webp`}
                    alt=""
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="pic-night"
                    src={`/reference/art/${item.art}-night.webp`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                </span>
                <b>{item.title}</b>
                <span>{item.description}</span>
              </button>
            );
          })}
        </div>
        <div
          className="dm-panel"
          id="dmPanel"
          role="tabpanel"
          aria-labelledby={`dmT-${active.id}`}
          tabIndex={-1}
        >
          <h3 className="dm-h">{active.title}</h3>
          <p className="dm-d">{active.description}</p>
          <ol className="flat-list dm-list">
            {active.tiles.map((tile, index) => (
              <li key={tile.id}>
                <a
                  className="flat-row"
                  href={tile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="dm-n" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="fr-t">
                    <b>{tile.title}</b>
                  </span>
                  <span className="dm-host">{hostLabel}</span>
                  <span className="sr-only">{newTab}</span>
                  <ExternalLinkIcon className="ext-ic" aria-hidden />
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** The group tabs beside the "All DMV services" list. */
export function DmvGroupTabs({
  groups,
  label,
}: {
  groups: { id: string; label: string; count: number }[];
  label: string;
}) {
  const { group, setGroup, query } = useExplorer();
  const searching = query.trim() !== "";

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = groups.findIndex((g) => g.id === group);
    const next = nextIndex(event, index, groups.length);
    if (next === null) return;
    event.preventDefault();
    setGroup(groups[next].id);
    document.getElementById(`dmAll-${groups[next].id}`)?.focus();
  }

  return (
    <div
      className="topics"
      role="tablist"
      aria-label={label}
      aria-orientation="vertical"
      onKeyDown={onKeyDown}
    >
      {groups.map((item) => {
        const selected = !searching && item.id === group;
        return (
          <button
            key={item.id}
            id={`dmAll-${item.id}`}
            type="button"
            role="tab"
            className="topic"
            aria-selected={selected}
            aria-controls={`group-${item.id}`}
            tabIndex={item.id === group ? 0 : -1}
            onClick={() => {
              setGroup(item.id);
              if (searching)
                document.getElementById(`group-${item.id}`)?.scrollIntoView();
            }}
          >
            <span className="topic-l">{item.label}</span>
            <span className="topic-n">{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Live result count under the "All DMV services" heading. */
export function DmvStatus() {
  const t = useTranslations("DmvServices");
  const { query, visibleCount } = useExplorer();
  return (
    <p className="dm-status" aria-live="polite" hidden={!query.trim()}>
      {query.trim()
        ? visibleCount === 0
          ? t("noResults")
          : t("resultCount", { count: visibleCount })
        : ""}
    </p>
  );
}
