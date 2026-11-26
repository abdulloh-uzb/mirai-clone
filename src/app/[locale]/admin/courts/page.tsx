import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminCourtsPage({
  params,
}: PageProps<"/[locale]/admin/courts">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.courts" });
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
  const svc = createServiceClient();
  const [counties, courts] = await Promise.all([
    svc.from("counties").select("*").order("name"),
    svc.from("courts").select("*").order("name"),
  ]);
  const countyOptions = (counties.data ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("courts")}
        description={t("hint", { example: '{"en": "..."}' })}
      />
      <CrudList
        title={t("counties")}
        table="counties"
        rows={counties.data ?? []}
        describe={(r) => String(r.name)}
      />
      <CrudList
        title={t("courthouses")}
        table="courts"
        rows={courts.data ?? []}
        selectOptions={{ county_id: countyOptions }}
      />
    </div>
  );
}
