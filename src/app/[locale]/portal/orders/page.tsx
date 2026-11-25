import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/orders">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Orders" });
  return { title: t("title") };
}

const STATUSES = [
  "pending",
  "paid",
  "refunded",
  "partially_refunded",
  "failed",
] as const;

export default async function OrdersPage({
  params,
}: PageProps<"/[locale]/portal/orders">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Orders" });
  const supabase = await createClient();
  // Own RLS read.
  const { data: orders } = await supabase
    .from("orders")
    .select("id, product, amount_cents, currency, status, created_at")
    .order("created_at", { ascending: false });

  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      {orders?.length ? (
        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="border-b text-sm text-muted-foreground">
              <th className="py-2 pr-4 font-medium">{t("date")}</th>
              <th className="py-2 pr-4 font-medium">{t("product")}</th>
              <th className="py-2 pr-4 font-medium">{t("amount")}</th>
              <th className="py-2 font-medium">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-3 pr-4">
                  {date.format(new Date(order.created_at))}
                </td>
                <td className="py-3 pr-4">
                  {t(`products.${order.product}` as "products.online_course")}
                </td>
                <td className="py-3 pr-4">
                  {money.format(order.amount_cents / 100)}
                </td>
                <td className="py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-sm">
                    {(STATUSES as readonly string[]).includes(order.status)
                      ? t(`statuses.${order.status}` as "statuses.paid")
                      : order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-6 text-muted-foreground">{t("empty")}</p>
      )}
      {/* Ticket 07: refund requests go here. */}
      <div id="refund-requests" />
    </section>
  );
}
