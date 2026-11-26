import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RefundQueue } from "@/components/admin/refund-queue";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminDetailList } from "@/components/admin/ui/detail-list";
import { AdminEmpty } from "@/components/admin/ui/empty";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/table";
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
  const [t, tr, tc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.orders" }),
    getTranslations({ locale, namespace: "Refunds" }),
    getTranslations({ locale, namespace: "Admin.common" }),
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
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={
          <span className="font-mono">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        }
        meta={<StatusBadge status={order.status} />}
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t("calculator")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              {preview ? (
                <>
                  <p className="text-sm font-medium">
                    {t("refundable", {
                      amount: formatUsd(preview.amountCents, locale),
                      pct: preview.pct,
                    })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tr(`reasons.${preview.reason}`)}
                  </p>
                </>
              ) : null}
            </AdminCardContent>
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("refunds")}</AdminCardTitle>
            </AdminCardHeader>
            {refunds?.length ? (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead className="text-right">
                      {t("amount")}
                    </AdminTableHead>
                    <AdminTableHead className="text-right">%</AdminTableHead>
                    <AdminTableHead>{t("status")}</AdminTableHead>
                    <AdminTableHead className="min-w-48 whitespace-normal">
                      {tc("reason")}
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {refunds.map((r) => (
                    <AdminTableRow key={r.id}>
                      <AdminTableCell className="text-right tabular-nums">
                        {formatUsd(r.amount_cents, locale)}
                      </AdminTableCell>
                      <AdminTableCell className="text-right tabular-nums">
                        {r.pct}%
                      </AdminTableCell>
                      <AdminTableCell>
                        <StatusBadge status={r.status} />
                      </AdminTableCell>
                      <AdminTableCell className="min-w-48 whitespace-normal">
                        {r.reason}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            ) : (
              <AdminEmpty title={tc("nothingYet")} />
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("tabRefunds")}</AdminCardTitle>
            </AdminCardHeader>
            <RefundQueue locale={locale} orderId={id} />
          </AdminCard>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{tc("summary")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminDetailList
              items={[
                {
                  label: t("user"),
                  value: (
                    <Link
                      href={`/admin/students/${order.user_id}`}
                      className="font-medium hover:underline"
                    >
                      {emails[order.user_id]}
                    </Link>
                  ),
                },
                {
                  label: t("product"),
                  value: (
                    <span className="font-mono text-xs">{order.product}</span>
                  ),
                },
                {
                  label: t("amount"),
                  value: formatUsd(order.amount_cents, locale),
                },
                {
                  label: t("status"),
                  value: <StatusBadge status={order.status} />,
                },
                { label: tc("date"), value: order.created_at.slice(0, 10) },
              ]}
            />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
