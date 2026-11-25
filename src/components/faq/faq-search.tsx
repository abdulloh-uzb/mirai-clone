"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { matchesFaqQuery } from "@/lib/faq/search";

const SHORTCUTS = ["refund", "finalExam", "certificate", "password"] as const;

/**
 * Search box and popular shortcuts around the server-rendered FAQ list. The
 * list is always complete without JavaScript; after hydration this hides the
 * items (and empty categories) that do not match.
 */
export function FaqSearch({ children }: { children: ReactNode }) {
  const t = useTranslations("Faq");
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [matchCount, setMatchCount] = useState<number | null>(null);

  function applyQuery(next: string) {
    setQuery(next);
    const root = listRef.current;
    if (!root) return;
    let count = 0;
    for (const item of root.querySelectorAll<HTMLElement>("[data-faq-item]")) {
      const match = matchesFaqQuery(item.dataset.search ?? "", next);
      item.hidden = !match;
      if (match) count += 1;
    }
    for (const section of root.querySelectorAll<HTMLElement>(
      "[data-faq-category]",
    )) {
      section.hidden = !section.querySelector("[data-faq-item]:not([hidden])");
    }
    setMatchCount(next.trim() ? count : null);
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
        onChange={(event) => applyQuery(event.target.value)}
        placeholder={t("searchPlaceholder")}
        className="mt-2 h-11 max-w-xl"
        autoComplete="off"
      />
      <div
        role="group"
        aria-label={t("popularLabel")}
        className="mt-3 flex flex-wrap items-center gap-2"
      >
        <span className="text-sm text-muted-foreground">
          {t("popularLabel")}
        </span>
        {SHORTCUTS.map((key) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => applyQuery(t(`shortcuts.${key}.term`))}
          >
            {t(`shortcuts.${key}.label`)}
          </Button>
        ))}
      </div>
      <p
        aria-live="polite"
        className="mt-3 min-h-6 text-sm text-muted-foreground"
      >
        {matchCount === null ? "" : t("resultCount", { count: matchCount })}
      </p>
      {matchCount === 0 ? <p className="mt-2">{t("noResults")}</p> : null}
      <div ref={listRef}>{children}</div>
    </div>
  );
}
