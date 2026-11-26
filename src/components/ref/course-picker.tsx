"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export type CourseLang = "en" | "ja" | "es" | "ru";

const ORDER: CourseLang[] = ["en", "ja", "es", "ru"];

export function Flag({ code }: { code: CourseLang }) {
  return (
    <span className="cc-flag cp-flag">
      <span
        className="flex size-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border/50"
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-full" focusable="false">
          {code === "en" ? (
            <>
              <rect width="32" height="32" fill="#fff" />
              {[0, 6, 12, 18, 24].map((y) => (
                <rect key={y} y={y} width="32" height="3" fill="#B22234" />
              ))}
              <rect y="30" width="32" height="2" fill="#B22234" />
              <rect width="14" height="17" fill="#3C3B6E" />
            </>
          ) : code === "ja" ? (
            <>
              <rect width="32" height="32" fill="#fff" />
              <circle cx="16" cy="16" r="8" fill="#BC002D" />
            </>
          ) : code === "es" ? (
            <>
              <rect width="32" height="32" fill="#AA151B" />
              <rect y="8" width="32" height="16" fill="#F1BF00" />
            </>
          ) : (
            <>
              <rect width="32" height="32" fill="#fff" />
              <rect y="10.66" width="32" height="10.67" fill="#0039A6" />
              <rect y="21.33" width="32" height="10.67" fill="#D52B1E" />
            </>
          )}
        </svg>
      </span>
    </span>
  );
}

/**
 * The home page's course language chooser: a radio group of four rows. Picking
 * a row updates the panel in place (picture, sentence and the start button);
 * nothing navigates. English is selected first.
 */
export function CoursePicker({
  groupLabel,
  statusLabel,
  rows,
  lines,
  goLabels,
  hrefs,
  altLabel,
  panelTop,
}: {
  groupLabel: string;
  statusLabel: string;
  rows: Record<CourseLang, { name: string; sub: string }>;
  lines: Record<CourseLang, string>;
  goLabels: Record<CourseLang, string>;
  hrefs: Record<CourseLang, string>;
  altLabel: string;
  panelTop: ReactNode;
}) {
  const [active, setActive] = useState<CourseLang>("en");

  function choose(code: CourseLang) {
    setActive(code);
    document.getElementById(`cp-row-${code}`)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = ORDER.indexOf(active);
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % ORDER.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index - 1 + ORDER.length) % ORDER.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = ORDER.length - 1;
    else return;
    event.preventDefault();
    choose(ORDER[next]);
  }

  return (
    <>
      <div
        className="cp-list"
        role="radiogroup"
        aria-label={groupLabel}
        onKeyDown={onKeyDown}
      >
        {ORDER.map((code) => {
          const checked = code === active;
          return (
            <button
              key={code}
              id={`cp-row-${code}`}
              type="button"
              role="radio"
              lang={code}
              className="cp-row"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => setActive(code)}
            >
              <Flag code={code} />
              <span className="cp-n">
                <b>{rows[code].name}</b>
                <small lang="en">{rows[code].sub}</small>
              </span>
              <span className="cp-pillstat live">{statusLabel}</span>
              <span className="cp-tick" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
      <div className="cp-panel" lang="en">
        {panelTop}
        <div className="cc-pic cp-pic cp-pic-stack">
          {ORDER.map((code) => (
            <div
              key={code}
              className="cp-pic-i"
              data-on={code === active ? "" : undefined}
              aria-hidden={code === active ? undefined : "true"}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={code === active ? altLabel : ""}
                width="1448"
                height="1086"
                src={`/reference/course-${code}.webp`}
                loading={code === "en" ? undefined : "lazy"}
              />
            </div>
          ))}
        </div>
        <div className="cp-foot">
          <p className="cp-line" aria-live="polite" lang="en">
            {lines[active]}
          </p>
          <Link
            className="btn btn-primary btn-lg cp-go"
            href={hrefs[active]}
            lang="en"
          >
            {goLabels[active]}
          </Link>
        </div>
      </div>
    </>
  );
}
