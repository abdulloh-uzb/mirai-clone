import { CircleCheckIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminEmpty } from "@/components/admin/ui/empty";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/table";
import { formatUsd } from "@/lib/courses/courses";
import type { Locale } from "@/i18n/routing";
import { decideRefund } from "@/lib/payments/refund-actions";
import { refundPreview } from "@/lib/payments/refund-preview";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/** Refund requests waiting for a decision (approve or deny, both audited). */
export async function RefundQueue({
  locale,
  orderId,
}: {
  locale: Locale;
  /** Limit to one order; omit for the whole queue. */
  orderId?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Refunds" });
  let query = createServiceClient()
    .from("refunds")
    .select("id, order_id, amount_cents, reason, created_at")
    .eq("status", "requested")
    .order("created_at");
  if (orderId) query = query.eq("order_id", orderId);
  const { data: refunds } = await query;
  const supabase = await createClient();
  const rows = await Promise.all(
    (refunds ?? []).map(async (refund) => ({
      refund,
      current: await refundPreview(refund.order_id, supabase),
    })),
  );

  if (!rows.length) {
    return <AdminEmpty icon={CircleCheckIcon} title={t("admin.empty")} />;
  }
  return (
    <AdminTable>
      <AdminTableHeader>
        <AdminTableRow>
          <AdminTableHead>{t("admin.order")}</AdminTableHead>
          <AdminTableHead>{t("admin.reason")}</AdminTableHead>
          <AdminTableHead className="text-right">
            {t("admin.amount")}
          </AdminTableHead>
          <AdminTableHead className="text-right">
            <span className="sr-only">
              {t("admin.approve")} / {t("admin.deny")}
            </span>
          </AdminTableHead>
        </AdminTableRow>
      </AdminTableHeader>
      <AdminTableBody>
        {rows.map(({ refund, current }) => (
          <AdminTableRow key={refund.id}>
            <AdminTableCell className="font-mono text-xs">
              {refund.order_id.slice(0, 8).toUpperCase()}
            </AdminTableCell>
            <AdminTableCell className="min-w-48 whitespace-normal">
              {refund.reason || t("admin.none")}
            </AdminTableCell>
            <AdminTableCell className="text-right tabular-nums">
              {formatUsd(refund.amount_cents, locale)}
              {current ? (
                <span className="block text-xs text-muted-foreground">
                  {t("preview", {
                    amount: formatUsd(current.amountCents, locale),
                    pct: current.pct,
                  })}
                </span>
              ) : null}
            </AdminTableCell>
            <AdminTableCell className="text-right">
              <form action={decideRefund} className="inline-flex gap-2">
                <input type="hidden" name="refundId" value={refund.id} />
                <AdminButton
                  type="submit"
                  name="decision"
                  value="approve"
                  size="sm"
                >
                  {t("admin.approve")}
                </AdminButton>
                <AdminButton
                  type="submit"
                  name="decision"
                  value="deny"
                  size="sm"
                  variant="destructive-outline"
                >
                  {t("admin.deny")}
                </AdminButton>
              </form>
            </AdminTableCell>
          </AdminTableRow>
        ))}
      </AdminTableBody>
    </AdminTable>
  );
}
