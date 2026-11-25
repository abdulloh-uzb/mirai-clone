import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { RefundQueue } from "@/components/admin/refund-queue";
import { StatusBadge } from "@/components/admin/status-badge";
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
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.orders" }),
    getTranslations({ locale, namespace: "Admin.common" }),
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
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <nav className="mt-4 flex gap-4 text-sm font-medium">
        <Link
          href="/admin/orders"
          className={tab === "orders" ? "underline" : ""}
        >
          {t("tabOrders")}
        </Link>
        <Link
          href={{ pathname: "/admin/orders", query: { tab: "refunds" } }}
          className={tab === "refunds" ? "underline" : ""}
        >
          {t("tabRefunds")}
        </Link>
      </nav>
      {tab === "refunds" ? (
        <RefundQueue locale={locale} />
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
                  className="font-mono underline"
                >
                  {r.id.slice(0, 8).toUpperCase()}
                </Link>
              ),
            },
            { header: t("user"), cell: (r) => emails[r.user_id] },
            { header: t("product"), cell: (r) => r.product },
            {
              header: t("amount"),
              cell: (r) => formatUsd(r.amount_cents, locale),
            },
            {
              header: t("status"),
              cell: (r) => <StatusBadge status={r.status} />,
            },
            { header: tc("date"), cell: (r) => r.created_at.slice(0, 10) },
          ]}
        />
      )}
    </section>
  );
}
