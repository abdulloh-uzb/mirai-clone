"use client";

import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/portal", key: "course", exact: true },
  { href: "/portal/profile", key: "account", exact: false },
  { href: "/portal/certificates", key: "certificates", exact: false },
  { href: "/faq", key: "faq", exact: false },
] as const;

const linkClass =
  "relative inline-flex min-h-11 shrink-0 items-center rounded-xl px-3 text-[15px] font-semibold text-muted-foreground hover:bg-accent hover:text-foreground";

/** Portal navigation under the site header. Scrolls sideways on narrow screens. */
export function PortalNav() {
  const t = useTranslations("PortalNav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("label")} className="border-b bg-background">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
        {ITEMS.map((item) => {
          // Course pages belong to "My course".
          const active = item.exact
            ? pathname === item.href || pathname.startsWith("/portal/course")
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  linkClass,
                  active &&
                    "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary",
                )}
              >
                {t(item.key)}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <button
            type="button"
            data-open-ai
            className={cn(linkClass, "gap-1.5")}
            onClick={() => window.dispatchEvent(new Event("open-ai-assistant"))}
          >
            <SparklesIcon className="size-4" aria-hidden />
            {t("askAi")}
          </button>
        </li>
      </ul>
    </nav>
  );
}
