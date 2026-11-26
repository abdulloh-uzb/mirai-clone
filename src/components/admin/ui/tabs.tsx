import { Link } from "@/i18n/navigation";

export const adminTabListClass = "flex flex-wrap gap-x-5 border-b";
export const adminTabClass =
  "-mb-px inline-flex h-9 items-center gap-1.5 border-b-2 border-transparent text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:border-primary aria-[current=page]:text-foreground aria-selected:border-primary aria-selected:text-foreground";

type Href = React.ComponentProps<typeof Link>["href"];

/** Tabs that are links (the tab lives in the URL). */
export function AdminTabNav({
  label,
  items,
}: {
  label: string;
  items: { key: string; href: Href; label: React.ReactNode; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className={adminTabListClass}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={adminTabClass}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
