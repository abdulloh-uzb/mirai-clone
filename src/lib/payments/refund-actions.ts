"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { handleStripeEvent } from "@/lib/payments/handle-event";
import { sendRefundRequestedEmail } from "@/lib/payments/payment-emails";
import { refundPreview } from "@/lib/payments/refund-preview";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe, paymentsMode } from "@/lib/stripe/server";

const requestSchema = z.object({
  orderId: z.uuid(),
  reason: z.string().trim().max(1000),
});

/** A Student asks for a refund. The DB re-checks the policy before saving. */
export async function requestRefund(formData: FormData): Promise<void> {
  const parsed = requestSchema.safeParse({
    orderId: formData.get("orderId"),
    reason: formData.get("reason") ?? "",
  });
  if (!parsed.success) return;
  const account = await getCurrentAccount();
  if (!account) return;
  const supabase = await createClient();
  const preview = await refundPreview(parsed.data.orderId, supabase);
  if (!preview || preview.pct === 0) return;
  const { error } = await supabase.rpc("request_refund", {
    p_order_id: parsed.data.orderId,
    p_reason: parsed.data.reason,
    p_pct: preview.pct,
    p_amount_cents: preview.amountCents,
  });
  if (error) {
    console.error("request_refund failed", error.message);
    return;
  }
  try {
    await sendRefundRequestedEmail(account.userId, preview.amountCents);
  } catch (e) {
    console.error("refund requested email failed", e);
  }
  revalidatePath("/", "layout");
}

const decideSchema = z.object({
  refundId: z.uuid(),
  decision: z.enum(["approve", "deny"]),
});

/** Admin only. Approve refunds through Stripe (or the mock event); deny just records it. */
export async function decideRefund(formData: FormData): Promise<void> {
  const parsed = decideSchema.safeParse({
    refundId: formData.get("refundId"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) return;
  const account = await getCurrentAccount();
  if (account?.role !== "admin") return;

  const service = createServiceClient();
  const { data: refund } = await service
    .from("refunds")
    .select("id, amount_cents, order_id, status")
    .eq("id", parsed.data.refundId)
    .single();
  if (!refund || refund.status !== "requested") return;

  if (parsed.data.decision === "deny") {
    await service.rpc("mark_refund", {
      p_refund_id: refund.id,
      p_status: "rejected",
      p_actor: account.userId,
    });
    revalidatePath("/", "layout");
    return;
  }

  const { data: order } = await service
    .from("orders")
    .select("stripe_payment_intent")
    .eq("id", refund.order_id)
    .single();
  const paymentIntent = order?.stripe_payment_intent;
  if (!paymentIntent) return;

  // Re-check the policy now: facts may have changed since the request.
  // TODO(spec): the approved amount stays the requested one; an admin can
  // approve a request that has since become ineligible.
  const { error } = await service.rpc("mark_refund", {
    p_refund_id: refund.id,
    p_status: "approved",
    p_actor: account.userId,
  });
  if (error) throw error;

  try {
    if (paymentsMode() === "stripe") {
      await getStripe().refunds.create({
        payment_intent: paymentIntent,
        amount: refund.amount_cents,
      });
      // The charge.refunded webhook finishes the job.
    } else {
      await handleStripeEvent({
        id: `evt_mock_refund_${refund.id}`,
        type: "charge.refunded",
        data: {
          object: {
            payment_intent: paymentIntent,
            amount_refunded: refund.amount_cents,
          },
        },
      });
    }
  } catch (e) {
    await service.rpc("mark_refund", {
      p_refund_id: refund.id,
      p_status: "failed",
      p_actor: account.userId,
    });
    throw e;
  }
  revalidatePath("/", "layout");
}
