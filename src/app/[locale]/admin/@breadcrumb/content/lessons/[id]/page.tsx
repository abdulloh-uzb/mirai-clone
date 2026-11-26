import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { createServiceClient } from "@/lib/supabase/service";

/** The lesson's own title as the last crumb. */
export default async function LessonBreadcrumb({
  params,
}: PageProps<"/[locale]/admin/content/lessons/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  if ((await getCurrentAccount())?.role !== "admin") return null;
  const t = await getTranslations({ locale, namespace: "Admin" });
  let titles: Record<string, string> = {};
  if (z.uuid().safeParse(id).success) {
    const { data } = await createServiceClient()
      .from("lessons")
      .select("title")
      .eq("id", id)
      .maybeSingle();
    titles = (data?.title ?? {}) as Record<string, string>;
  }
  return (
    <AdminBreadcrumb
      label={t("shell.breadcrumbLabel")}
      items={[
        { label: t("nav.content"), href: "/admin/content" },
        { label: titles[locale] || titles.en || t("shell.details") },
      ]}
    />
  );
}
