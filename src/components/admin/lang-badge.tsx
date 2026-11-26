import { AdminBadge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";

export const LANGUAGE_NAMES = {
  en: "English",
  ja: "日本語",
  es: "Español",
  ru: "Русский",
} as const;

/**
 * A language chip (EN, JA…) in green when translated or red when not, with a
 * tooltip that says so on hover or keyboard focus.
 */
export function LangBadge({
  code,
  ok,
  tip,
}: {
  code: string;
  ok: boolean;
  tip: string;
}) {
  return (
    <span className="group relative inline-flex" tabIndex={0} aria-label={tip}>
      <AdminBadge
        tone={ok ? "success" : "danger"}
        className="px-1 text-[10px] uppercase"
        aria-hidden="true"
      >
        {code}
      </AdminBadge>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-md",
          "invisible opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100",
          ok ? "bg-foreground text-background" : "bg-destructive text-white",
        )}
      >
        {tip}
      </span>
    </span>
  );
}
