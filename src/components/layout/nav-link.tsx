"use client";

import { Link, usePathname } from "@/i18n/navigation";

/** Main-nav link; the reference CSS styles `a[aria-current]` as the active section. */
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
    <Link href={href} aria-current={active ? "true" : undefined}>
      {children}
    </Link>
  );
}
