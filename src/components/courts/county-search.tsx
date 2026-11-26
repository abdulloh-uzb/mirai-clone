"use client";

import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchesCountyQuery } from "@/lib/courts/search";
import type { CountySummary } from "@/lib/courts/types";

type Item = { county: CountySummary; row: ReactNode };

/**
 * Search box plus the County list. The server renders every row, so the full
 * list shows without JavaScript; after hydration the box hides non-matching rows.
 */
export function CountySearch({ items }: { items: Item[] }) {
  const t = useTranslations("Courts");
  const [query, setQuery] = useState("");
  const inputId = useId();
  const visible = items.filter((item) =>
    matchesCountyQuery(item.county, query),
  );

  return (
    <div>
      <Label htmlFor={inputId} className="text-base">
        {t("searchLabel")}
      </Label>
      <Input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="mt-2 h-11 max-w-xl"
        autoComplete="off"
      />
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
