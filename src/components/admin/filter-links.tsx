import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Href = React.ComponentProps<typeof Link>["href"];

export function AdminFilterLinks({
  label,
  items,
  className,
}: {
  label: string;
  items: { key: string; href: Href; label: React.ReactNode; active: boolean }[];
  className?: string;
}) {
  return (
    <nav aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium hover:bg-accent aria-[current=page]:border-primary aria-[current=page]:bg-accent"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
