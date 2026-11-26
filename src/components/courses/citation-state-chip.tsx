"use client";

import { ChevronDownIcon, MapPinIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** The "Where is your ticket from?" chip button. Shared by the shell and the lazy popover. */
export function CitationStateChip({
  label,
  className,
  ...props
}: ComponentProps<"button"> & { label: string }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-sm font-medium shadow-xs hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <MapPinIcon aria-hidden className="size-4 text-link" />
      {label}
      <ChevronDownIcon aria-hidden className="size-4 opacity-60" />
    </button>
  );
}
