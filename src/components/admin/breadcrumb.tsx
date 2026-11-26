import { ChevronRightIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Crumb } from "./nav";

export function AdminBreadcrumb({
  items,
  label,
}: {
  items: Crumb[];
  label: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={label} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li
            key={`${i}-${item.label}`}
            className={cn(
              "flex min-w-0 items-center gap-1.5",
              i < items.length - 1 && "max-md:hidden",
            )}
          >
            {i > 0 ? (
              <ChevronRightIcon aria-hidden className="size-3.5 shrink-0" />
            ) : null}
            {item.href ? (
              <Link href={item.href} className="truncate hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="truncate font-medium text-foreground"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
