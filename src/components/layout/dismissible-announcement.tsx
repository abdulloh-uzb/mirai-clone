"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  addDismissed,
  DISMISSED_ANNOUNCEMENTS_COOKIE,
} from "@/lib/dismissed-announcements";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function rememberDismissed(id: string) {
  const value = addDismissed(readCookie(DISMISSED_ANNOUNCEMENTS_COOKIE), id);
  document.cookie = `${DISMISSED_ANNOUNCEMENTS_COOKIE}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function DismissibleAnnouncement({
  id,
  message,
  label,
  dismissLabel,
  action,
}: {
  id: string;
  message: string;
  label: string;
  dismissLabel: string;
  /** Extra control next to the message, such as the "Got a problem?" button. */
  action?: ReactNode;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <section
      aria-label={label}
      className="bg-gradient-to-r from-[#e8f6e4] to-[#f4fbf2] text-sm text-[#1d283a] dark:from-[#12301f] dark:to-[#0f2a2c] dark:text-[#e9f1f6]"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span
          aria-hidden
          className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-green text-[#0f1217]"
        >
          <CheckIcon className="size-3.5" />
        </span>
        <p className="flex-1 font-semibold text-pretty">{message}</p>
        {action}
        <button
          type="button"
          aria-label={dismissLabel}
          onClick={() => {
            rememberDismissed(id);
            setDismissed(true);
          }}
          className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
        >
          <XIcon aria-hidden className="size-4" />
        </button>
      </div>
    </section>
  );
}
