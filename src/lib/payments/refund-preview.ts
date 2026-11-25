import "server-only";
import { z } from "zod";
import {
  calculateRefund,
  type RefundEnrollment,
  type RefundOrder,
} from "@/lib/payments/refund";
import { createClient } from "@/lib/supabase/server";

const factsSchema = z.object({
  paidAt: z.coerce.date(),
  amountCents: z.number(),
  status: z.string(),
  lessonsStarted: z.boolean(),
  examStarted: z.boolean(),
  certificateIssued: z.boolean(),
});

/** The refund preview for one order, from the DB facts (own order or admin). */
export async function refundPreview(
  orderId: string,
  client?: Awaited<ReturnType<typeof createClient>>,
) {
  const supabase = client ?? (await createClient());
  const { data } = await supabase.rpc("refund_facts", { p_order_id: orderId });
  const facts = factsSchema.safeParse(data);
  if (!facts.success) return null;
  const order: RefundOrder = facts.data;
  const enrollment: RefundEnrollment = facts.data;
  return calculateRefund(order, enrollment, new Date());
}
