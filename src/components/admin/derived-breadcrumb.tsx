import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getCrumbLabels } from "./crumb-labels";
import { PathBreadcrumb } from "./path-breadcrumb";

/** The default breadcrumb: crumbs derived from the URL. */
export async function DerivedBreadcrumb() {
  const current = await getLocale();
  const locale = hasLocale(routing.locales, current)
    ? current
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <PathBreadcrumb
      labels={await getCrumbLabels(locale)}
      ariaLabel={t("shell.breadcrumbLabel")}
    />
  );
}
