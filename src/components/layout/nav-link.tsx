"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/** Main-nav link with a rounded underline bar on the active section. */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-xl px-3 py-2 text-[15px] font-semibold text-[#424751] hover:bg-accent dark:text-muted-foreground dark:hover:text-foreground",
        active &&
          "text-foreground after:absolute after:inset-x-3 after:bottom-0.5 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-brand-green dark:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
