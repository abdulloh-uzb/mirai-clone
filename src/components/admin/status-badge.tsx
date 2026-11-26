import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const TONES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  paid: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  processed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  paused: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  requested: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  locked: "bg-destructive/15 text-destructive",
  expired: "bg-destructive/15 text-destructive",
  failed: "bg-destructive/15 text-destructive",
  rejected: "bg-destructive/15 text-destructive",
};

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin.statuses");
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {t.has(status as never)
        ? t(status as never)
        : status.replaceAll("_", " ")}
    </span>
  );
}
