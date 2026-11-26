import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { AdminBreadcrumb } from "@/components/admin/breadcrumb";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { createServiceClient } from "@/lib/supabase/service";

/** The Student's name as the last crumb. */
export default async function StudentBreadcrumb({
  params,
}: PageProps<"/[locale]/admin/students/[userId]">) {
  const { locale, userId } = await params;
  if (!hasLocale(routing.locales, locale)) return null;
  if ((await getCurrentAccount())?.role !== "admin") return null;
  const t = await getTranslations({ locale, namespace: "Admin" });
  let name = "";
  if (z.uuid().safeParse(userId).success) {
    const { data } = await createServiceClient()
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", userId)
      .maybeSingle();
    name = data ? `${data.first_name} ${data.last_name}`.trim() : "";
  }
  return (
    <AdminBreadcrumb
      label={t("shell.breadcrumbLabel")}
      items={[
        { label: t("nav.students"), href: "/admin/students" },
        { label: name || t("shell.details") },
      ]}
    />
  );
}
