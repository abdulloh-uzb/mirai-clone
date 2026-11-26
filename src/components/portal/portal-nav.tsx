"use client";

import { SparklesIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { LmsWrap } from "@/components/layout/lms-page";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/portal", key: "course", exact: true },
  { href: "/portal/profile", key: "account", exact: false },
  { href: "/portal/certificates", key: "certificates", exact: false },
  { href: "/faq", key: "faq", exact: false },
] as const;

// The reference segmented control (`.seg`): the current page is a white pill.
const linkClass =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[11px] px-4 text-[15px] font-bold whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:px-5";

/** Portal navigation in the page band. Scrolls sideways on narrow screens. */
export function PortalNav() {
  const t = useTranslations("PortalNav");
  const pathname = usePathname();
  return (
    <nav aria-label={t("label")} className="lms-band">
      <LmsWrap className="pt-3">
        <ul className="inline-flex max-w-full [scrollbar-width:none] gap-1.5 overflow-x-auto rounded-[14px] bg-card/70 p-1 dark:bg-hero">
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
                      "bg-card text-foreground shadow-[0_2px_8px_-4px_#0a304659] dark:bg-[#1b3240]",
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
              className={cn(linkClass, "text-blue-text")}
              onClick={() =>
                window.dispatchEvent(new Event("open-ai-assistant"))
              }
            >
              <SparklesIcon className="size-4" aria-hidden />
              {t("askAi")}
            </button>
          </li>
        </ul>
      </LmsWrap>
    </nav>
  );
}
