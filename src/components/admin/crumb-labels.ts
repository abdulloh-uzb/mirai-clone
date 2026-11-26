import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { ADMIN_NAV_ITEMS, type CrumbLabels } from "./nav";

export async function getCrumbLabels(locale: Locale): Promise<CrumbLabels> {
  const t = await getTranslations({ locale, namespace: "Admin" });
  const sections: Record<string, string> = { "/admin": t("nav.dashboard") };
  for (const item of ADMIN_NAV_ITEMS) {
    const label = t(`nav.${item.key as "dashboard"}`);
    sections[item.href] = label;
    for (const alias of item.aliases ?? []) sections[alias] = label;
  }
  return { sections, details: t("shell.details"), view: t("students.viewAs") };
}
