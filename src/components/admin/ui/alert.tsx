import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  danger:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
} as const;

export function AdminAlert({
  tone = "info",
  icon: Icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  tone?: keyof typeof TONES;
  icon?: LucideIcon;
}) {
  return (
    <div
      data-slot="admin-alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        TONES[tone],
        className,
      )}
      {...props}
    >
      {Icon ? <Icon aria-hidden className="mt-0.5 size-4 shrink-0" /> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
