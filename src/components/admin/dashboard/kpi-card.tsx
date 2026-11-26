import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AdminCard } from "../ui/card";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  href?: string;
}) {
  const card = (
    <AdminCard className="p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon aria-hidden className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </AdminCard>
  );
  if (!href) return card;
  return (
    <Link
      href={href}
      className="rounded-lg transition-colors hover:[&>div]:border-primary/60"
    >
      {card}
    </Link>
  );
}
