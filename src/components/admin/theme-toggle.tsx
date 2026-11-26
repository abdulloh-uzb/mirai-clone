"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { AdminButton } from "./ui/button";

const subscribe = () => () => {};

export function AdminThemeToggle({ label }: { label: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";
  return (
    <AdminButton
      type="button"
      variant="ghost"
      size="icon-sm"
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Switched by CSS, so the server render never has to know the theme. */}
      <SunIcon aria-hidden className="dark:hidden" />
      <MoonIcon aria-hidden className="hidden dark:block" />
    </AdminButton>
  );
}
