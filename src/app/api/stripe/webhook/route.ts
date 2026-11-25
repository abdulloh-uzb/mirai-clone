import { NextResponse } from "next/server";
import { handleStripeEvent } from "@/lib/payments/handle-event";
import { getStripe, paymentsMode } from "@/lib/stripe/server";

export const runtime = "nodejs";

/** Stripe webhook. Verifies the signature, then hands the event to the shared handler. */
export async function POST(req: Request) {
  if (paymentsMode() === "mock") {
    return new NextResponse(null, { status: 404 });
  }
  const signature = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }
  const body = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }
  await handleStripeEvent({
    id: event.id,
    type: event.type,
    data: { object: { ...event.data.object } },
  });
  return NextResponse.json({ received: true });
}
