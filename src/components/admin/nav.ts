import type { LucideIcon } from "lucide-react";
import {
  BookOpenIcon,
  BotIcon,
  ClipboardListIcon,
  FileCheckIcon,
  FileTextIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  ListChecksIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

type NavItemShape = {
  key: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  aliases?: readonly string[];
};

export const ADMIN_NAV = [
  {
    group: "overview",
    items: [
      {
        key: "dashboard",
        href: "/admin",
        icon: LayoutDashboardIcon,
        exact: true,
      },
    ],
  },
  {
    group: "people",
    items: [
      { key: "students", href: "/admin/students", icon: UsersIcon },
      {
        key: "enrollments",
        href: "/admin/enrollments",
        icon: ClipboardListIcon,
      },
    ],
  },
  {
    group: "sales",
    items: [
      {
        key: "orders",
        href: "/admin/orders",
        icon: ReceiptIcon,
        aliases: ["/admin/refunds"],
      },
    ],
  },
  {
    group: "compliance",
    items: [
      { key: "reporting", href: "/admin/reporting", icon: FileCheckIcon },
      { key: "courts", href: "/admin/courts", icon: LandmarkIcon },
    ],
  },
  {
    group: "content",
    items: [
      { key: "content", href: "/admin/content", icon: BookOpenIcon },
      {
        key: "questions",
        href: "/admin/content/questions",
        icon: ListChecksIcon,
      },
      {
        key: "siteContent",
        href: "/admin/site-content",
        icon: FileTextIcon,
      },
    ],
  },
  {
    group: "support",
    items: [
      { key: "tickets", href: "/admin/tickets", icon: LifeBuoyIcon },
      { key: "ai", href: "/admin/ai", icon: BotIcon },
    ],
  },
  {
    group: "system",
    items: [{ key: "settings", href: "/admin/settings", icon: SettingsIcon }],
  },
] as const satisfies readonly {
  group: string;
  items: readonly NavItemShape[];
}[];

export type AdminNavGroupKey = (typeof ADMIN_NAV)[number]["group"];
export type AdminNavKey = (typeof ADMIN_NAV)[number]["items"][number]["key"];

export const ADMIN_NAV_ITEMS: readonly NavItemShape[] = ADMIN_NAV.flatMap(
  (g): readonly NavItemShape[] => g.items,
);

export type Crumb = { label: string; href?: string };
export type CrumbLabels = {
  sections: Record<string, string>;
  details: string;
  view: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The nav href to highlight: the longest matching prefix; `exact` items match only themselves. */
export function activeNavHref(
  pathname: string,
  items: readonly Pick<NavItemShape, "href" | "exact" | "aliases">[],
): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  let best: { href: string; length: number } | null = null;
  for (const item of items) {
    for (const p of [item.href, ...(item.aliases ?? [])]) {
      const hit = item.exact
        ? path === p
        : path === p || path.startsWith(`${p}/`);
      if (hit && (!best || p.length > best.length)) {
        best = { href: item.href, length: p.length };
      }
    }
  }
  return best?.href ?? null;
}

/** Crumbs from the path. "/admin" alone is "Dashboard"; deeper pages start at their section. A uuid
 *  is "Details" (a link unless last), a last "view" is the view label, other unknown segments
 *  (e.g. "lessons") are skipped. The last crumb has no href. */
export function buildCrumbs(pathname: string, labels: CrumbLabels): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "admin") return [];
  if (parts.length === 1) return [{ label: labels.sections["/admin"]! }];
  const crumbs: Crumb[] = [];
  let path = "/admin";
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]!;
    const last = i === parts.length - 1;
    path += `/${part}`;
    const label =
      labels.sections[path] ??
      (UUID.test(part)
        ? labels.details
        : last
          ? part === "view"
            ? labels.view
            : labels.details
          : undefined);
    if (label) crumbs.push({ label, href: last ? undefined : path });
  }
  return crumbs;
}
