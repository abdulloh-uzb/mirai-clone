import "server-only";
import Stripe from "stripe";

/** Mock payments mode when no Stripe secret key is configured (lms spec decision 1). */
export function paymentsMode(): "stripe" | "mock" {
  return process.env.STRIPE_SECRET_KEY ? "stripe" : "mock";
}

let stripe: Stripe | undefined;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  stripe ??= new Stripe(key);
  return stripe;
}

/** The mock checkout route works in mock mode, and in production only with PAYMENTS_MOCK=1. */
export function mockCheckoutAllowed(): boolean {
  return (
    paymentsMode() === "mock" &&
    (process.env.NODE_ENV !== "production" || process.env.PAYMENTS_MOCK === "1")
  );
}
