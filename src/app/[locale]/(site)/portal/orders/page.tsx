import { LmsBody, LmsHero } from "@/components/layout/lms-page";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { requestRefund } from "@/lib/payments/refund-actions";
import { refundPreview } from "@/lib/payments/refund-preview";
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

  const { data: refunds } = await supabase
    .from("refunds")
    .select("order_id, status, created_at")
    .order("created_at", { ascending: false });
  const refundOf = (orderId: string) =>
    refunds?.find((r) => r.order_id === orderId);
  const tr = await getTranslations({ locale, namespace: "Refunds" });
  const previews = new Map(
    await Promise.all(
      (orders ?? [])
        .filter((o) => o.status === "paid")
        .map(async (o) => [o.id, await refundPreview(o.id, supabase)] as const),
    ),
  );

  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <>
      <LmsHero title={t("title")} />
      <LmsBody className="max-w-4xl">
        {orders?.length ? (
          <table className="lms-table">
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("product")}</th>
                <th>{t("amount")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{date.format(new Date(order.created_at))}</td>
                  <td>
                    {t(`products.${order.product}` as "products.online_course")}
                  </td>
                  <td>{money.format(order.amount_cents / 100)}</td>
                  <td>
                    <span className="rounded-full border-[1.5px] border-line-blue bg-hero px-2.5 py-0.5 text-[13px] font-extrabold">
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
        <div id="refund-requests" className="mt-8 space-y-6">
          {(orders ?? [])
            .filter((o) => o.status === "paid")
            .map((order) => {
              const preview = previews.get(order.id);
              const refund = refundOf(order.id);
              const open =
                refund?.status === "requested" || refund?.status === "approved";
              if (!preview) return null;
              return (
                <div
                  key={order.id}
                  className="rounded-[22px] border border-line-blue bg-card p-5 sm:p-6"
                >
                  <p className="text-sm text-muted-foreground">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                  {refund ? (
                    <p className="mt-1 font-medium">
                      {tr(`statuses.${refund.status}` as "statuses.requested")}
                    </p>
                  ) : null}
                  {preview.pct > 0 ? (
                    <p className="mt-1">
                      {tr("preview", {
                        amount: money.format(preview.amountCents / 100),
                        pct: preview.pct,
                      })}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tr(`reasons.${preview.reason}` as "reasons.not_paid")}
                  </p>
                  {preview.pct > 0 && !open ? (
                    <form action={requestRefund} className="mt-3 space-y-2">
                      <input type="hidden" name="orderId" value={order.id} />
                      <label className="block text-sm">
                        {tr("reasonLabel")}
                        <textarea
                          name="reason"
                          maxLength={1000}
                          className="mt-1.5 block min-h-24 w-full rounded-[14px] border-2 border-input bg-card px-4 py-3 text-[17px] outline-none focus-visible:border-primary"
                        />
                      </label>
                      <button type="submit" className={buttonVariants()}>
                        {tr("request")}
                      </button>
                    </form>
                  ) : null}
                </div>
              );
            })}
        </div>
      </LmsBody>
    </>
  );
}
