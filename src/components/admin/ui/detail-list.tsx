import { cn } from "@/lib/utils";

/** Label/value rows for a Summary card. Put it straight under AdminCardHeader. */
export function AdminDetailList({
  items,
  className,
}: {
  items: { label: string; value: React.ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y text-sm", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-start justify-between gap-4 px-4 py-2.5"
        >
          <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-right font-medium break-words">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
