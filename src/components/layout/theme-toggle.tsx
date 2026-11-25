"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Pill switch. The knob position comes from the `dark` class (set by next-themes
// before paint), so the server render never has to know the theme.
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
      className="relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full border border-soft-border bg-[#d6ecfb] transition-colors dark:bg-brand-navy/40"
    >
      <span
        aria-hidden
        className="absolute left-1 grid size-6 place-items-center rounded-full bg-white text-amber-500 shadow transition-transform dark:translate-x-5 dark:bg-primary dark:text-primary-foreground"
      >
        <SunIcon className="size-3.5 dark:hidden" />
        <MoonIcon className="hidden size-3.5 dark:block" />
      </span>
    </button>
  );
}
