"use client";

import { ChevronDownIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

/** Opens the AI assistant panel (the layout listens for this event). */
export function OpenAssistantButton({
  className,
  label,
  children,
}: {
  className?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      onClick={() => window.dispatchEvent(new Event("open-ai-assistant"))}
    >
      {children}
    </button>
  );
}

/** Filters the county rows in `#counties` as the visitor types (the home page's court search). */
export function CountyFilterInput({
  placeholder,
  listId,
}: {
  placeholder: string;
  listId: string;
}) {
  return (
    <input
      id="countySearch"
      type="search"
      placeholder={placeholder}
      autoComplete="off"
      onChange={(event) => {
        const query = event.target.value.trim().toLowerCase();
        document
          .querySelectorAll<HTMLElement>(`#${listId} > li`)
          .forEach((item) => {
            item.hidden =
              query !== "" && !item.textContent?.toLowerCase().includes(query);
          });
      }}
    />
  );
}

/** The reference accordion (`.v2-acc`), one item open at a time. */
export function V2Accordion({
  items,
}: {
  items: { id: string; question: ReactNode; answer: ReactNode }[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      {items.map((item) => {
        const isOpen = open === item.id;
        const state = isOpen ? "open" : "closed";
        return (
          <div
            key={item.id}
            data-state={state}
            data-orientation="vertical"
            className="v2-acc-i border-0"
          >
            <h3 data-state={state} className="m-0">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-${item.id}`}
                data-state={state}
                id={`acc-q-${item.id}`}
                className="v2-acc-q"
                onClick={() => setOpen(isOpen ? null : item.id)}
              >
                <span>{item.question}</span>
                <ChevronDownIcon aria-hidden />
              </button>
            </h3>
            <div
              id={`acc-${item.id}`}
              role="region"
              aria-labelledby={`acc-q-${item.id}`}
              data-state={state}
              hidden={!isOpen}
              className="v2-acc-a"
            >
              <div className="p-0">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </>
  );
}
