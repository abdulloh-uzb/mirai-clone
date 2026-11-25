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
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border bg-muted transition-colors"
    >
      <SunIcon
        aria-hidden
        className="absolute left-1.5 size-4 text-muted-foreground"
      />
      <MoonIcon
        aria-hidden
        className="absolute right-1.5 size-4 text-muted-foreground"
      />
      <span
        aria-hidden
        className="absolute left-1 size-6 rounded-full bg-background shadow transition-transform dark:translate-x-6 dark:bg-primary"
      />
    </button>
  );
}
