"use client";

import { SearchIcon } from "lucide-react";
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { matchesCountyQuery } from "@/lib/courts/search";
import type { CountySummary } from "@/lib/courts/types";
import paths from "./ca-county-paths.json";

type Explorer = {
  query: string;
  setQuery: (query: string) => void;
  selected: string | null;
  setSelected: (slug: string | null) => void;
  counties: CountySummary[];
};

const ExplorerContext = createContext<Explorer | null>(null);

function useExplorer(): Explorer {
  const value = useContext(ExplorerContext);
  if (!value) throw new Error("CourtsExplorer is missing");
  return value;
}

/** Shares the search text and the County picked on the map. */
export function CourtsExplorer({
  counties,
  children,
}: {
  counties: CountySummary[];
  children: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const value = useMemo(
    () => ({ query, setQuery, selected, setSelected, counties }),
    [query, selected, counties],
  );
  return (
    <ExplorerContext.Provider value={value}>
      {children}
    </ExplorerContext.Provider>
  );
}

/** The hero search form and the popular chips. */
export function CourtsSearchForm({
  goLabel,
  popularLabel,
  chips,
}: {
  goLabel: string;
  popularLabel: string;
  chips: string[];
}) {
  const t = useTranslations("Courts");
  const inputId = useId();
  const { query, setQuery } = useExplorer();
  return (
    <>
      <form
        className="tool-search tool-search-stack"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          document.getElementById("all-heading")?.scrollIntoView();
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
      <div className="tool-pop" role="group" aria-label={popularLabel}>
        <span>{popularLabel}</span>
        {chips.map((chip) => (
          <button
            key={chip}
            type="button"
            className="tool-chip"
            aria-pressed={query === chip}
            onClick={() => setQuery(query === chip ? "" : chip)}
          >
            {chip}
          </button>
        ))}
      </div>
    </>
  );
}

/** The California map: one button per County. Picking one fills the panel. */
export function CountyMap({
  label,
  source,
}: {
  label: string;
  source: string;
}) {
  const { query, selected, setSelected, counties } = useExplorer();
  const searching = query.trim() !== "";
  const matching = new Set(
    counties.filter((c) => matchesCountyQuery(c, query)).map((c) => c.slug),
  );
  return (
    <div className="cx-map">
      <svg
        className="cx-svg"
        viewBox="0 0 828 960"
        role="group"
        aria-label={label}
      >
        {paths.map((county) => {
          const isSelected = county.slug === selected;
          const isMatch = searching && matching.has(county.slug);
          const isDim = searching && !isMatch && !isSelected;
          return (
            <path
              key={county.slug}
              d={county.d}
              className={`cx-c${isSelected ? "is-sel" : ""}${isMatch ? "is-match" : ""}${isDim ? "is-dim" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${county.name} County`}
              aria-pressed={isSelected}
              onClick={() => setSelected(isSelected ? null : county.slug)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelected(isSelected ? null : county.slug);
                }
              }}
            />
          );
        })}
      </svg>
      <p className="cx-src">{source}</p>
    </div>
  );
}

/** Right-hand panel: the picker (server content) until a County is chosen. */
export function CountyPanel({
  children,
  seeLabel,
  clearLabel,
}: {
  children: ReactNode;
  seeLabel: string;
  clearLabel: string;
}) {
  const t = useTranslations("Courts");
  const { selected, setSelected, counties } = useExplorer();
  const county = counties.find((c) => c.slug === selected);
  return (
    <div className="cx-panel" id="cxPanel" tabIndex={-1} aria-live="polite">
      {county ? (
        <>
          <h2 className="cx-name">{county.name}</h2>
          <p className="cx-cities">{county.seatCity}</p>
          <p className="cx-codes">
            {county.courthouses
              .filter((c) => c.courtCode)
              .map((c) => (
                <span key={c.courtCode}>
                  {t("courtCode", { code: c.courtCode ?? "" })}
                </span>
              ))}
          </p>
          <Link
            className="btn btn-primary btn-lg cx-go"
            href={`/courts/${county.slug}`}
          >
            {seeLabel}
          </Link>
          <button
            type="button"
            className="btn btn-ghost cx-go"
            onClick={() => setSelected(null)}
          >
            {clearLabel}
          </button>
        </>
      ) : (
        children
      )}
    </div>
  );
}

type Item = { county: CountySummary; row: ReactNode };

/** The "All counties" list, filtered by the hero search. */
export function CountyList({ items }: { items: Item[] }) {
  const t = useTranslations("Courts");
  const { query } = useExplorer();
  const visible = items.filter((item) =>
    matchesCountyQuery(item.county, query),
  );
  return (
    <div>
      <p
        aria-live="polite"
        className="mt-2 min-h-6 text-sm text-muted-foreground"
      >
        {query.trim() ? t("resultCount", { count: visible.length }) : ""}
      </p>
      {visible.length === 0 ? (
        <p className="mt-4">{t("noResults")}</p>
      ) : (
        <ul aria-label={t("listLabel")} className="cx-idx mt-2">
          {visible.map((item) => (
            <li key={item.county.slug}>{item.row}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
