"use client";

import { XIcon } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";

const EVENT = "dismissible-notice";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/**
 * Wraps a floating notice with a close button. Closing hides it for the rest
 * of the browser session (sessionStorage), so it comes back on the next visit.
 */
export function DismissibleNotice({
  storageKey,
  closeLabel,
  children,
}: {
  storageKey: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const hidden = useSyncExternalStore(
    subscribe,
    () => sessionStorage.getItem(storageKey) === "1",
    () => false,
  );

  if (hidden) return null;

  return (
    <div className="relative">
      {children}
      <button
        type="button"
        aria-label={closeLabel}
        onClick={() => {
          sessionStorage.setItem(storageKey, "1");
          window.dispatchEvent(new Event(EVENT));
        }}
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-background/70 hover:text-foreground"
      >
        <XIcon aria-hidden className="size-4" />
      </button>
    </div>
  );
}
