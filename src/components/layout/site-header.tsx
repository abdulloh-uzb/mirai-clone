import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { HeaderAccount } from "./header-account";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { mainNav } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const t = useTranslations("Header");

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 rounded-2xl border bg-background/90 px-4 shadow-sm backdrop-blur">
        <Link
          href="/"
          aria-label={t("homeLink")}
          className="flex items-center gap-2 rounded-md font-bold tracking-tight"
        >
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-primary text-sm text-primary-foreground"
          >
            R
          </span>
          {/* Wordmark text hidden on phones so the account controls fit. */}
          <span className="max-sm:sr-only">{siteConfig.shortName}</span>
        </Link>

        <nav aria-label={t("mainNav")} className="hidden flex-1 md:block">
          <ul className="flex items-center justify-center gap-1">
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle label={t("darkTheme")} />
          <LanguageSwitcher />
          <HeaderAccount />
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
