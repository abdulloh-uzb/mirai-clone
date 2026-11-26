import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
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
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t("hint", { example: '{"en": "..."}' })}
      </p>
      <h2 className="mt-8 text-xl font-semibold">{t("counties")}</h2>
      <CrudList
        table="counties"
        rows={counties.data ?? []}
        describe={(r) => String(r.name)}
      />
      <h2 className="mt-8 text-xl font-semibold">{t("courthouses")}</h2>
      <CrudList
        table="courts"
        rows={courts.data ?? []}
        selectOptions={{ county_id: countyOptions }}
      />
    </section>
  );
}
