import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { RefundQueue } from "@/components/admin/refund-queue";
import { StatusBadge } from "@/components/admin/status-badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { emailsFor } from "@/lib/admin/emails";
import { formatUsd } from "@/lib/courses/courses";
import { refundPreview } from "@/lib/payments/refund-preview";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/orders/[id]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.orders" });
  return { title: t("title") };
}

export default async function AdminOrderPage({
  params,
}: PageProps<"/[locale]/admin/orders/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (!z.uuid().safeParse(id).success) notFound();
  await requireAdmin();
  const [t, tr] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.orders" }),
    getTranslations({ locale, namespace: "Refunds" }),
  ]);
  const svc = createServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("id, user_id, product, amount_cents, status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!order) notFound();
  const [emails, preview, { data: refunds }] = await Promise.all([
    emailsFor([order.user_id]),
    // The admin's own client: refund_facts allows admins.
    createClient().then((c) => refundPreview(id, c)),
    svc
      .from("refunds")
      .select("id, amount_cents, pct, status, reason, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">
        {order.id.slice(0, 8).toUpperCase()}
      </h1>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("user")}</dt>
          <dd>
            <Link
              href={`/admin/students/${order.user_id}`}
              className="underline"
            >
              {emails[order.user_id]}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("product")}</dt>
          <dd>{order.product}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("amount")}</dt>
          <dd>{formatUsd(order.amount_cents, locale)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("status")}</dt>
          <dd>
            <StatusBadge status={order.status} />
          </dd>
        </div>
      </dl>

      <h2 className="mt-8 text-xl font-semibold">{t("calculator")}</h2>
      {preview ? (
        <p className="mt-2 text-sm">
          {t("refundable", {
            amount: formatUsd(preview.amountCents, locale),
            pct: preview.pct,
          })}{" "}
          <span className="text-muted-foreground">
            {tr(`reasons.${preview.reason}`)}
          </span>
        </p>
      ) : null}

      <h2 className="mt-8 text-xl font-semibold">{t("refunds")}</h2>
      <ul className="mt-2 text-sm">
        {(refunds ?? []).map((r) => (
          <li key={r.id} className="flex gap-3">
            <span>{formatUsd(r.amount_cents, locale)}</span>
            <span>{r.pct}%</span>
            <StatusBadge status={r.status} />
            <span>{r.reason}</span>
          </li>
        ))}
      </ul>
      <RefundQueue locale={locale} orderId={id} />
    </section>
  );
}
