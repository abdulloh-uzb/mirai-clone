import { ArrowLeftIcon, LogOutIcon } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { signOut } from "@/lib/auth/actions";
import type { CurrentAccount } from "@/lib/auth/current-account";
import { ADMIN_NAV, type AdminNavGroupKey, type AdminNavKey } from "./nav";
import { AdminSidebarNav } from "./sidebar-nav";
import { AdminButton, adminButtonVariants } from "./ui/button";

export async function AdminSidebar({
  locale,
  account,
}: {
  locale: Locale;
  account: CurrentAccount;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  const groupLabels = Object.fromEntries(
    ADMIN_NAV.map((g) => [g.group, t(`navGroups.${g.group}`)]),
  ) as Record<AdminNavGroupKey, string>;
  const itemLabels = Object.fromEntries(
    ADMIN_NAV.flatMap((g) =>
      g.items.map((i) => [i.key, t(`nav.${i.key}`)] as const),
    ),
  ) as Record<AdminNavKey, string>;
  const name =
    `${account.firstName} ${account.lastName}`.trim() || account.email;

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        className="flex h-14 shrink-0 items-center gap-2 border-b px-4"
      >
        <BrandLogo height={30} />
        <span className="rounded border px-1.5 py-px text-[11px] font-medium text-muted-foreground">
          {t("shell.adminTag")}
        </span>
      </Link>
      <AdminSidebarNav
        label={t("shell.navLabel")}
        groupLabels={groupLabels}
        itemLabels={itemLabels}
      />
      <div className="shrink-0 border-t p-3">
        <div className="px-2 pb-2">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {account.email}
          </p>
        </div>
        <Link
          href="/"
          className={adminButtonVariants({
            variant: "ghost",
            size: "sm",
            className: "w-full justify-start",
          })}
        >
          <ArrowLeftIcon aria-hidden />
          {t("shell.backToSite")}
        </Link>
        <form action={signOut.bind(null, locale)}>
          <AdminButton
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
          >
            <LogOutIcon aria-hidden />
            {t("shell.signOut")}
          </AdminButton>
        </form>
      </div>
    </div>
  );
}
