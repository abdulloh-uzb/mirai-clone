import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RefundQueue } from "@/components/admin/refund-queue";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminCard } from "@/components/admin/ui/card";
import { AdminTabNav } from "@/components/admin/ui/tabs";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { emailsFor } from "@/lib/admin/emails";
import { formatUsd } from "@/lib/courses/courses";
import { createServiceClient } from "@/lib/supabase/service";

const PAGE_SIZE = 25;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/orders">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.orders" });
  return { title: t("title") };
}

export default async function AdminOrdersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/orders">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const tab = sp.tab === "refunds" ? "refunds" : "orders";
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tc, tNav, tDesc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.orders" }),
    getTranslations({ locale, namespace: "Admin.common" }),
    getTranslations({ locale, namespace: "Admin.nav" }),
    getTranslations({ locale, namespace: "Admin.descriptions" }),
  ]);

  const { data } =
    tab === "orders"
      ? await createServiceClient()
          .from("orders")
          .select("id, user_id, product, amount_cents, status, created_at")
          .order("created_at", { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
      : { data: [] };
  const rows = data ?? [];
  const emails = await emailsFor(rows.map((r) => r.user_id));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={tNav("orders")} description={tDesc("orders")} />
      <AdminTabNav
        label={t("title")}
        items={[
          {
            key: "orders",
            href: "/admin/orders",
            label: t("tabOrders"),
            active: tab === "orders",
          },
          {
            key: "refunds",
            href: { pathname: "/admin/orders", query: { tab: "refunds" } },
            label: t("tabRefunds"),
            active: tab === "refunds",
          },
        ]}
      />
      {tab === "refunds" ? (
        <AdminCard className="overflow-hidden">
          <RefundQueue locale={locale} />
        </AdminCard>
      ) : (
        <DataTable
          locale={locale}
          rows={rows}
          rowKey={(r) => r.id}
          basePath="/admin/orders"
          page={page}
          pageSize={PAGE_SIZE}
          columns={[
            {
              header: t("title"),
              cell: (r) => (
                <Link
                  href={`/admin/orders/${r.id}`}
                  className="font-mono text-xs font-medium hover:underline"
                >
                  {r.id.slice(0, 8).toUpperCase()}
                </Link>
              ),
            },
            { header: t("user"), cell: (r) => emails[r.user_id] },
            {
              header: t("product"),
              cell: (r) => r.product,
              className: "font-mono text-xs",
            },
            {
              header: t("amount"),
              cell: (r) => formatUsd(r.amount_cents, locale),
              className: "text-right tabular-nums",
            },
            {
              header: t("status"),
              cell: (r) => <StatusBadge status={r.status} />,
            },
            {
              header: tc("date"),
              cell: (r) => r.created_at.slice(0, 10),
              className: "tabular-nums",
            },
          ]}
        />
      )}
    </div>
  );
}
