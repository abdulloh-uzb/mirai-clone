"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchesTile } from "@/lib/dmv-services/search";

type Tile = { id: string; title: string; keywords: string };

/**
 * Search box wrapping the server-rendered groups. Without JavaScript the full
 * list shows; after hydration the box hides non-matching tiles (marked with
 * `data-tile`) and groups left empty (marked with `data-group`).
 */
export function TileSearch({
  tiles,
  children,
}: {
  tiles: Tile[];
  children: ReactNode;
}) {
  const t = useTranslations("DmvServices");
  const [query, setQuery] = useState("");
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const hidden = new Set(
    tiles.filter((tile) => !matchesTile(tile, query)).map((tile) => tile.id),
  );
  const visibleCount = tiles.length - hidden.size;

  function onChange(value: string) {
    setQuery(value);
    const root = listRef.current;
    if (!root) return;
    for (const group of root.querySelectorAll<HTMLElement>("[data-group]")) {
      let anyVisible = false;
      for (const el of group.querySelectorAll<HTMLElement>("[data-tile]")) {
        const tile = tiles.find((x) => x.id === el.dataset.tile);
        const show = !tile || matchesTile(tile, value);
        el.hidden = !show;
        if (show) anyVisible = true;
      }
      group.hidden = !anyVisible;
    }
  }

  return (
    <div>
      <Label htmlFor={inputId} className="text-base">
        {t("searchLabel")}
      </Label>
      <Input
        id={inputId}
        type="search"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="mt-2 h-11 max-w-xl"
        autoComplete="off"
      />
      <p
        aria-live="polite"
        className="mt-2 min-h-6 text-sm text-muted-foreground"
      >
        {query.trim()
          ? visibleCount === 0
            ? t("noResults")
            : t("resultCount", { count: visibleCount })
          : ""}
      </p>
      <div ref={listRef} className="mt-6 space-y-10">
        {children}
      </div>
    </div>
  );
}
