import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminAlert } from "@/components/admin/ui/alert";
import { AdminBadge } from "@/components/admin/ui/badge";
import {
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminTabNav } from "@/components/admin/ui/tabs";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { CRUD, type CrudTable } from "@/lib/admin/crud";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe, paymentsMode } from "@/lib/stripe/server";

type TabKey =
  | "faq"
  | "pages"
  | "announcements"
  | "changelog"
  | "posts"
  | "reviews"
  | "prices"
  | "coupons";

const TABS: { key: TabKey; table?: CrudTable }[] = [
  { key: "faq", table: "faq_items" },
  { key: "pages", table: "pages" },
  { key: "announcements", table: "announcements" },
  { key: "changelog", table: "changelog" },
  { key: "posts", table: "posts" },
  { key: "reviews", table: "reviews" },
  { key: "prices", table: "courses" },
  { key: "coupons" },
];

/** Slugs that exist in some UI languages but not all of them. */
function untranslated(rows: { locale?: unknown; slug?: unknown }[]) {
  const bySlug = new Map<string, Set<string>>();
  for (const r of rows) {
    if (typeof r.slug !== "string") continue;
    bySlug.set(r.slug, (bySlug.get(r.slug) ?? new Set()).add(String(r.locale)));
  }
  return [...bySlug.entries()]
    .map(([slug, have]) => ({
      slug,
      missing: routing.locales.filter((l) => !have.has(l)),
    }))
    .filter((x) => x.missing.length > 0);
}

async function Coupons({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Admin.siteContent" });

  const header = (
    <AdminCardHeader>
      <AdminCardTitle>{t("tabs.coupons")}</AdminCardTitle>
    </AdminCardHeader>
  );

  if (paymentsMode() === "mock") {
    // TODO(spec): coupons are Stripe promotion codes; nothing to manage in mock mode.
    return (
      <AdminCard className="overflow-hidden">
        {header}
        <AdminEmpty icon={InfoIcon} title={t("couponsNeedStripe")} />
      </AdminCard>
    );
  }
  const codes = await getStripe().promotionCodes.list({ limit: 50 });
  return (
    <AdminCard className="overflow-hidden">
      {header}
      {codes.data.length === 0 ? (
        <AdminEmpty title={t("noCodes")} />
      ) : (
        <ul className="divide-y text-sm">
          {codes.data.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between px-4 py-2.5"
            >
              <span className="font-mono text-xs font-medium">{c.code}</span>
              {c.active ? null : <AdminBadge>{t("inactive")}</AdminBadge>}
            </li>
          ))}
        </ul>
      )}
    </AdminCard>
  );
}

export default async function AdminSiteContentPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/site-content">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.siteContent" });
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
  const tDesc = await getTranslations({
    locale,
    namespace: "Admin.descriptions",
  });
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  let rows: Record<string, unknown>[] = [];
  if (tab.table) {
    const { data } = await createServiceClient()
      .from(tab.table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    rows = (data ?? []) as Record<string, unknown>[];
  }
  const gaps =
    tab.table && CRUD[tab.table].fields.some((f) => f.name === "slug")
      ? untranslated(rows)
      : [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("siteContent")}
        description={tDesc("siteContent")}
      />
      <AdminTabNav
        label={tNav("siteContent")}
        items={TABS.map((tab_) => ({
          key: tab_.key,
          href: `/admin/site-content?tab=${tab_.key}`,
          label: t(`tabs.${tab_.key}`),
          active: tab_.key === tab.key,
        }))}
      />
      {tab.key === "coupons" ? (
        <Coupons locale={locale} />
      ) : tab.table ? (
        <>
          {tab.key === "reviews" ? (
            // TODO(spec): reviews have no "sample" column; all seeded reviews are samples.
            <AdminAlert tone="info" icon={InfoIcon}>
              {t("samples")}
            </AdminAlert>
          ) : null}
          {gaps.length ? (
            <AdminAlert tone="warning" icon={TriangleAlertIcon}>
              {t("missing", {
                list: gaps
                  .map((g) => `${g.slug} (${g.missing.join(", ")})`)
                  .join("; "),
              })}
            </AdminAlert>
          ) : null}
          <CrudList
            title={t(`tabs.${tab.key}`)}
            table={tab.table}
            rows={rows}
            allowCreate={tab.table !== "courses"}
            allowDelete={tab.table !== "courses"}
          />
        </>
      ) : null}
    </div>
  );
}
