"use client";

import type { ComponentProps } from "react";

/** The phone menu button. Shared by the server-rendered shell and the lazy sheet. */
export function MobileMenuTrigger({
  label,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      className="icon-btn menu-btn"
      aria-label={label}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M4 12h16M4 17h16"></path>
      </svg>
    </button>
  );
}
