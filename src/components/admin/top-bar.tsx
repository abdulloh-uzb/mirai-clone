import { SearchIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { languages } from "@/i18n/languages";
import { getPathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { initialsOf, type CurrentAccount } from "@/lib/auth/current-account";
import { AdminAccountMenu } from "./account-menu";
import { AdminLanguageMenu } from "./language-menu";
import { AdminSearch } from "./search-form";
import { AdminThemeToggle } from "./theme-toggle";
import { adminButtonVariants } from "./ui/button";

export async function AdminTopBar({
  locale,
  account,
  breadcrumb,
  mobileNav,
}: {
  locale: Locale;
  account: CurrentAccount;
  breadcrumb: React.ReactNode;
  mobileNav: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  const tLang = await getTranslations({
    locale,
    namespace: "LanguageSwitcher",
  });
  const tHeader = await getTranslations({ locale, namespace: "Header" });

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur lg:px-6">
      {mobileNav}
      <div className="min-w-0 flex-1">{breadcrumb}</div>
      <div className="hidden flex-1 justify-center md:flex">
        <AdminSearch
          action={getPathname({ href: "/admin/students", locale })}
          label={t("shell.searchLabel")}
          placeholder={t("shell.searchPlaceholder")}
          className="w-full max-w-sm"
        />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1 md:flex-1">
        <Link
          href="/admin/students"
          aria-label={t("shell.searchLabel")}
          className={adminButtonVariants({
            variant: "ghost",
            size: "icon-sm",
            className: "md:hidden",
          })}
        >
          <SearchIcon aria-hidden />
        </Link>
        <AdminLanguageMenu
          label={tLang("label", { language: languages[locale].nativeName })}
        />
        <AdminThemeToggle label={tHeader("darkTheme")} />
        <AdminAccountMenu
          firstName={account.firstName}
          initials={initialsOf(account)}
          name={
            `${account.firstName} ${account.lastName}`.trim() || account.email
          }
          email={account.email}
          labels={{
            menu: t("shell.accountMenu"),
            backToSite: t("shell.backToSite"),
            signOut: t("shell.signOut"),
          }}
        />
      </div>
    </header>
  );
}
