import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { formatUsd } from "@/lib/courses/courses";
import { decideRefund } from "@/lib/payments/refund-actions";
import { refundPreview } from "@/lib/payments/refund-preview";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/refunds">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Refunds" });
  return { title: t("admin.title") };
}

// Minimal: ticket 10 folds this into the Admin Orders module. The Admin
// layout already 404s for everyone but Admins.
export default async function AdminRefundsPage({
  params,
}: PageProps<"/[locale]/admin/refunds">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Refunds" });
  const { data: refunds } = await createServiceClient()
    .from("refunds")
    .select("id, order_id, amount_cents, reason, created_at")
    .eq("status", "requested")
    .order("created_at");
  const supabase = await createClient();
  const rows = await Promise.all(
    (refunds ?? []).map(async (refund) => ({
      refund,
      current: await refundPreview(refund.order_id, supabase),
    })),
  );

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("admin.title")}</h1>
      {rows.length ? (
        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="border-b text-sm text-muted-foreground">
              <th className="py-2 pr-4 font-medium">{t("admin.order")}</th>
              <th className="py-2 pr-4 font-medium">{t("admin.reason")}</th>
              <th className="py-2 pr-4 font-medium">{t("admin.amount")}</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ refund, current }) => (
              <tr key={refund.id} className="border-b align-top">
                <td className="py-3 pr-4 font-mono text-sm">
                  {refund.order_id.slice(0, 8).toUpperCase()}
                </td>
                <td className="py-3 pr-4">
                  {refund.reason || t("admin.none")}
                </td>
                <td className="py-3 pr-4">
                  {formatUsd(refund.amount_cents, locale)}
                  {current ? (
                    <span className="block text-sm text-muted-foreground">
                      {t("preview", {
                        amount: formatUsd(current.amountCents, locale),
                        pct: current.pct,
                      })}
                    </span>
                  ) : null}
                </td>
                <td className="py-3">
                  <form action={decideRefund} className="flex gap-2">
                    <input type="hidden" name="refundId" value={refund.id} />
                    <button
                      type="submit"
                      name="decision"
                      value="approve"
                      className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
                    >
                      {t("admin.approve")}
                    </button>
                    <button
                      type="submit"
                      name="decision"
                      value="deny"
                      className="rounded-md border px-3 py-1 text-sm"
                    >
                      {t("admin.deny")}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-6 text-muted-foreground">{t("admin.empty")}</p>
      )}
    </section>
  );
}
