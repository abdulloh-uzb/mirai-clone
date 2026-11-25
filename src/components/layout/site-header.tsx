import { SignpostIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { NavLink } from "./nav-link";
import { HeaderAccount } from "./header-account";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { mainNav } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const t = useTranslations("Header");

  return (
    <header className="sticky top-3 z-40 px-3 pt-3">
      <div className="header-pill mx-auto flex h-16 max-w-[1440px] items-center gap-4 rounded-3xl border border-white/85 bg-white/95 pr-2 pl-4 backdrop-blur dark:border-white/10 dark:bg-[rgba(12,27,36,0.94)]">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md font-bold tracking-tight"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-lg bg-brand-navy text-sm text-white dark:bg-primary dark:text-primary-foreground"
          >
            <SignpostIcon className="size-4" />
          </span>
          {/* Wordmark text hidden on phones so the account controls fit. */}
          <span className="max-sm:sr-only">{siteConfig.shortName}</span>
          <span className="sr-only">, {t("homeLink")}</span>
        </Link>

        <nav aria-label={t("mainNav")} className="hidden flex-1 md:block">
          <ul className="flex items-center justify-center gap-1">
            {mainNav.map((item) => (
              <li key={item.key}>
                <NavLink href={item.href}>{t(item.key)}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <div className="flex items-center gap-2 rounded-[18px] bg-secondary p-1 pl-2">
            <ThemeToggle label={t("darkTheme")} />
            <LanguageSwitcher />
          </div>
          <HeaderAccount />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
