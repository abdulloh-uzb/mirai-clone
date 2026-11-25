export type RefundOrder = {
  paidAt: Date;
  amountCents: number;
  status: string;
};

export type RefundEnrollment = {
  lessonsStarted: boolean;
  examStarted: boolean;
  certificateIssued: boolean;
} | null;

export type RefundReason =
  | "full_window_unstarted"
  | "half_window_started"
  | "outside_window"
  | "exam_started"
  | "certificate_issued"
  | "not_paid";

export type RefundDecision = {
  pct: 0 | 50 | 100;
  amountCents: number;
  reason: RefundReason;
};

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Spec section 8 refund table. Pure. Mirrored in SQL by `public.refund_pct`,
 * which re-checks every request.
 */
export function calculateRefund(
  order: RefundOrder,
  enrollment: RefundEnrollment,
  now: Date,
): RefundDecision {
  const none = (reason: RefundReason): RefundDecision => ({
    pct: 0,
    amountCents: 0,
    reason,
  });
  if (order.status !== "paid") return none("not_paid");
  if (now.getTime() - order.paidAt.getTime() > WINDOW_MS)
    return none("outside_window");
  if (enrollment?.certificateIssued) return none("certificate_issued");
  if (enrollment?.examStarted) return none("exam_started");
  if (enrollment?.lessonsStarted) {
    return {
      pct: 50,
      amountCents: Math.round((order.amountCents * 50) / 100),
      reason: "half_window_started",
    };
  }
  return {
    pct: 100,
    amountCents: order.amountCents,
    reason: "full_window_unstarted",
  };
}
