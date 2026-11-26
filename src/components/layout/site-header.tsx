import { SignpostIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { languages } from "@/i18n/languages";
import { Link } from "@/i18n/navigation";
import { NavLink } from "./nav-link";
import { HeaderAccount } from "./header-account";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { mainNav } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

/** The reference header (`.hdr > .cap`), with our own logo mark in place of their logo image. */
export function SiteHeader() {
  const t = useTranslations("Header");
  const tLanguage = useTranslations("LanguageSwitcher");
  const languageLabel = tLanguage("label", {
    language: languages[useLocale()].nativeName,
  });

  return (
    <div className="v2 v2-contents">
      <header className="hdr">
        <div className="cap">
          <Link className="logo" href="/">
            <span aria-hidden className="logo-mark">
              <SignpostIcon />
            </span>
            <span className="logo-word max-sm:sr-only">
              {siteConfig.shortName}
            </span>
            <span className="sr-only">, {t("homeLink")}</span>
          </Link>

          <nav className="nav" aria-label={t("mainNav")}>
            {mainNav.map((item) => (
              <NavLink key={item.key} href={item.href}>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>

          <div className="hdr-right">
            <div className="ctl" role="group">
              <ThemeToggle label={t("darkTheme")} />
              <LanguageSwitcher label={languageLabel} />
            </div>
            <HeaderAccount />
            <MobileMenu label={t("openMenu")} />
          </div>
        </div>
      </header>
    </div>
  );
}
