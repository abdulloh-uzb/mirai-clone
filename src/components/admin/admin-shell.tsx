import { getTranslations } from "next-intl/server";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/layout/skip-link";
import type { Locale } from "@/i18n/routing";
import type { CurrentAccount } from "@/lib/auth/current-account";
import { AdminMobileNav } from "./mobile-nav";
import { AdminSidebar } from "./sidebar";
import { AdminTopBar } from "./top-bar";

/** Sidebar and top bar frame for every Admin page (ADR 0005). */
export async function AdminShell({
  locale,
  account,
  breadcrumb,
  children,
}: {
  locale: Locale;
  account: CurrentAccount;
  breadcrumb: React.ReactNode;
  children: React.ReactNode;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  const sidebar = <AdminSidebar locale={locale} account={account} />;
  return (
    <div className="admin-shell flex min-h-dvh flex-1 bg-background text-sm text-foreground">
      <SkipLink />
      <aside
        aria-label={t("shell.sidebarLabel")}
        className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:block"
      >
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar
          locale={locale}
          account={account}
          breadcrumb={breadcrumb}
          mobileNav={
            <AdminMobileNav
              openLabel={t("shell.openMenu")}
              title={t("shell.menuTitle")}
            >
              {sidebar}
            </AdminMobileNav>
          }
        />
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          className="flex-1 px-4 py-6 outline-none lg:px-8"
        >
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
