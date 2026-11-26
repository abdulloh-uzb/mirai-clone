"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// The reference's pill switch (`.tswitch`). The knob position comes from the
// theme attribute on <html> (set by next-themes before paint), so the server
// render never has to know the theme.
export function ThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={isDark}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="tswitch theme-btn"
    >
      <span className="ts-track" aria-hidden="true">
        <span className="ts-stars"></span>
        <span className="ts-knob">
          <span className="ts-sun">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4.2"></circle>
              <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"></path>
            </svg>
          </span>
          <span className="ts-moon">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"></path>
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
}
