import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const ADMIN_SECTIONS = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/students", key: "students" },
  { href: "/admin/enrollments", key: "enrollments" },
  { href: "/admin/orders", key: "orders" },
  { href: "/admin/reporting", key: "reporting" },
  { href: "/admin/content", key: "content" },
  { href: "/admin/courts", key: "courts" },
  { href: "/admin/site-content", key: "siteContent" },
  { href: "/admin/ai", key: "ai" },
  { href: "/admin/tickets", key: "tickets" },
  { href: "/admin/settings", key: "settings" },
] as const;

/** Sidebar frame for every Admin page. Links to unbuilt sections show a stub. */
export async function AdminShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row">
      <nav aria-label={t("navLabel")} className="md:w-52 md:shrink-0">
        <ul className="flex flex-wrap gap-1 md:flex-col">
          {ADMIN_SECTIONS.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                {t(`nav.${s.key}`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
