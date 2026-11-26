"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
  ADMIN_NAV,
  ADMIN_NAV_ITEMS,
  activeNavHref,
  type AdminNavGroupKey,
  type AdminNavKey,
} from "./nav";

export function AdminSidebarNav({
  label,
  groupLabels,
  itemLabels,
}: {
  label: string;
  groupLabels: Record<AdminNavGroupKey, string>;
  itemLabels: Record<AdminNavKey, string>;
}) {
  const active = activeNavHref(usePathname(), ADMIN_NAV_ITEMS);
  return (
    <nav aria-label={label} className="flex-1 overflow-y-auto px-2 py-3">
      {ADMIN_NAV.map((g) => (
        <div key={g.group} className="mb-3 last:mb-0">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
            {groupLabels[g.group]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={item.href === active ? "page" : undefined}
                    className="flex h-8 items-center gap-2 rounded-md px-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground"
                  >
                    <Icon aria-hidden className="size-4 shrink-0" />
                    {itemLabels[item.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
