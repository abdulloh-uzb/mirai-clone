import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { handleStripeEvent } from "@/lib/payments/handle-event";
import { createClient } from "@/lib/supabase/server";
import { mockCheckoutAllowed } from "@/lib/stripe/server";

export const runtime = "nodejs";

/**
 * Mock payments mode only. Pretends Stripe finished checkout by passing a fake
 * `checkout.session.completed` to the same handler the real webhook uses.
 * Visiting it again replays the same event id, which creates nothing.
 */
export async function GET(req: NextRequest) {
  if (!mockCheckoutAllowed()) return new NextResponse(null, { status: 404 });
  const account = await getCurrentAccount();
  if (!account) return new NextResponse(null, { status: 401 });

  const parsed = z
    .uuid()
    .safeParse(req.nextUrl.searchParams.get("order") ?? "");
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const orderId = parsed.data;

  // Own RLS read: the order must belong to the signed-in user.
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, course_locale")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return new NextResponse(null, { status: 404 });

  // A pending order is fulfilled; a paid one replays the same event id (a no-op).
  if (order.status === "pending" || order.status === "paid") {
    await handleStripeEvent({
      id: `evt_mock_${orderId}`,
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_mock_${orderId}`,
          payment_intent: `pi_mock_${orderId}`,
          metadata: {
            order_id: orderId,
            course_locale: order.course_locale ?? "en",
          },
        },
      },
    });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("preferred_locale")
    .eq("user_id", account.userId)
    .maybeSingle();
  const locale: Locale = (routing.locales as readonly string[]).includes(
    profile?.preferred_locale ?? "",
  )
    ? (profile?.preferred_locale as Locale)
    : routing.defaultLocale;
  const path = getPathname({ href: "/portal?paid=1", locale });
  return NextResponse.redirect(new URL(path, req.url));
}
