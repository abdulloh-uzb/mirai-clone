import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/service", () => ({ createServiceClient: vi.fn() }));
vi.mock("@/lib/payments/payment-emails", () => ({
  sendPaymentEmails: vi.fn(),
  sendRefundProcessedEmail: vi.fn(),
}));

import { handleStripeEvent, type PaymentEvent } from "./handle-event";

const completed = (overrides: Partial<PaymentEvent> = {}): PaymentEvent => ({
  id: "evt_1",
  type: "checkout.session.completed",
  data: {
    object: {
      id: "cs_1",
      payment_intent: "pi_1",
      metadata: { order_id: "order-1" },
    },
  },
  ...overrides,
});

function deps(fulfilled: boolean) {
  return {
    fulfill: vi.fn().mockResolvedValue(fulfilled),
    sendEmails: vi.fn().mockResolvedValue(undefined),
    applyRefund: vi.fn().mockResolvedValue(fulfilled),
    sendRefundEmail: vi.fn().mockResolvedValue(undefined),
  };
}

describe("handleStripeEvent", () => {
  it("ignores other event types", async () => {
    const d = deps(true);
    expect(await handleStripeEvent(completed({ type: "ping" }), d)).toBe(
      "ignored",
    );
    expect(d.fulfill).not.toHaveBeenCalled();
  });

  it("ignores a session without an order id", async () => {
    const d = deps(true);
    const event = completed({
      data: { object: { id: "cs_1", metadata: {} } },
    });
    expect(await handleStripeEvent(event, d)).toBe("ignored");
  });

  it("fulfills and emails once", async () => {
    const d = deps(true);
    expect(await handleStripeEvent(completed(), d)).toBe("processed");
    expect(d.fulfill).toHaveBeenCalledWith({
      eventId: "evt_1",
      eventType: "checkout.session.completed",
      orderId: "order-1",
      sessionId: "cs_1",
      paymentIntent: "pi_1",
    });
    expect(d.sendEmails).toHaveBeenCalledWith("order-1");
  });

  it("sends no emails for a replayed event", async () => {
    const d = deps(false);
    expect(await handleStripeEvent(completed(), d)).toBe("duplicate");
    expect(d.sendEmails).not.toHaveBeenCalled();
  });

  it("does not fail when emails fail", async () => {
    const d = deps(true);
    d.sendEmails.mockRejectedValue(new Error("smtp down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await handleStripeEvent(completed(), d)).toBe("processed");
  });

  it("applies a refund event and emails once", async () => {
    const d = deps(true);
    const event: PaymentEvent = {
      id: "evt_r",
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_1", amount_refunded: 2499 } },
    };
    expect(await handleStripeEvent(event, d)).toBe("processed");
    expect(d.applyRefund).toHaveBeenCalledWith({
      eventId: "evt_r",
      paymentIntent: "pi_1",
      amountRefunded: 2499,
    });
    expect(d.sendRefundEmail).toHaveBeenCalledWith("pi_1");
  });

  it("does not email a replayed refund event", async () => {
    const d = deps(false);
    const event: PaymentEvent = {
      id: "evt_r",
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_1", amount_refunded: 1 } },
    };
    expect(await handleStripeEvent(event, d)).toBe("duplicate");
    expect(d.sendRefundEmail).not.toHaveBeenCalled();
  });
});
