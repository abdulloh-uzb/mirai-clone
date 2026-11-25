import "server-only";
import { sendPaymentEmails } from "@/lib/payments/payment-emails";
import { createServiceClient } from "@/lib/supabase/service";

/** The part of `Stripe.Event` we read, so the mock route can build one too. */
export type PaymentEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

export type HandleResult = "processed" | "duplicate" | "ignored";

export type PaymentDeps = {
  fulfill: (args: {
    eventId: string;
    eventType: string;
    orderId: string;
    sessionId: string | null;
    paymentIntent: string | null;
  }) => Promise<boolean>;
  sendEmails: (orderId: string) => Promise<void>;
};

const str = (value: unknown): string | null =>
  typeof value === "string" && value ? value : null;

async function fulfillWithService(
  args: Parameters<PaymentDeps["fulfill"]>[0],
): Promise<boolean> {
  const { data, error } = await createServiceClient().rpc("fulfill_checkout", {
    p_event_id: args.eventId,
    p_event_type: args.eventType,
    p_order_id: args.orderId,
    p_session_id: args.sessionId ?? undefined,
    p_payment_intent: args.paymentIntent ?? undefined,
  });
  if (error) throw error;
  return data === true;
}

const defaultDeps: PaymentDeps = {
  fulfill: fulfillWithService,
  sendEmails: sendPaymentEmails,
};

/**
 * The one place a payment event changes anything. Called by the signed Stripe
 * webhook and by the mock checkout route. Enrollments are created only by
 * `fulfill_checkout`, which is idempotent by event id.
 */
export async function handleStripeEvent(
  event: PaymentEvent,
  deps: PaymentDeps = defaultDeps,
): Promise<HandleResult> {
  switch (event.type) {
    case "checkout.session.completed": {
      const object = event.data.object;
      const metadata =
        typeof object.metadata === "object" && object.metadata !== null
          ? (object.metadata as Record<string, unknown>)
          : {};
      const orderId = str(metadata.order_id);
      if (!orderId) return "ignored";
      const created = await deps.fulfill({
        eventId: event.id,
        eventType: event.type,
        orderId,
        sessionId: str(object.id),
        paymentIntent: str(object.payment_intent),
      });
      if (!created) return "duplicate";
      try {
        await deps.sendEmails(orderId);
      } catch (error) {
        console.error("payment emails failed", error);
      }
      return "processed";
    }
    // Ticket 07 adds charge.refunded here.
    default:
      return "ignored";
  }
}
