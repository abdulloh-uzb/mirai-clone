import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ADMIN_SECTIONS } from "@/components/admin/admin-shell";
import { routing } from "@/i18n/routing";

// Stub for Admin sections that arrive in a later ticket (11). Real pages at
// /admin/<section> take precedence over this dynamic route.
export default async function AdminStubPage({
  params,
}: PageProps<"/[locale]/admin/[section]">) {
  const { locale, section } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const entry = ADMIN_SECTIONS.find((s) => s.href === `/admin/${section}`);
  if (!entry) notFound();
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">
        {t(`nav.${entry.key}`)}
      </h1>
      <p className="mt-4 text-muted-foreground">{t("comingSoon")}</p>
    </section>
  );
}
