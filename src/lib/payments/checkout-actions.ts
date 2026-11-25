"use server";

import { getTranslations } from "next-intl/server";
import { redirect as redirectTo } from "next/navigation";
import { z } from "zod";
import { getPathname, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getOnlineCourse } from "@/lib/courses/courses";
import { publicEnv } from "@/lib/env";
import { currentEnrollmentId } from "@/lib/payments/enrollment-status";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe, paymentsMode } from "@/lib/stripe/server";

const checkoutSchema = z.object({
  courseLanguage: z.enum(routing.locales),
  uiLocale: z.enum(routing.locales),
});

/**
 * Creates the pending order and sends the Student to pay (Stripe Checkout, or
 * the mock route when no Stripe key is set). Never creates an enrollment: only
 * the payment event handler does.
 */
export async function startCheckout(formData: FormData): Promise<void> {
  const parsed = checkoutSchema.safeParse({
    courseLanguage: formData.get("courseLanguage"),
    uiLocale: formData.get("uiLocale"),
  });
  if (!parsed.success) return;
  const { courseLanguage, uiLocale } = parsed.data;

  const account = await getCurrentAccount();
  if (!account) {
    redirect({ href: "/login", locale: uiLocale });
    return;
  }
  const portal = { pathname: "/portal", query: { course: courseLanguage } };
  if (!account.emailVerified) {
    redirect({
      href: { ...portal, query: { ...portal.query, error: "verifyEmail" } },
      locale: uiLocale,
    });
    return;
  }
  if (await currentEnrollmentId(account.userId)) {
    redirect({ href: "/portal", locale: uiLocale });
    return;
  }

  const course = await getOnlineCourse();
  const service = createServiceClient();
  const { data: order, error } = await service
    .from("orders")
    .insert({
      user_id: account.userId,
      product: "online_course",
      amount_cents: course.priceCents,
      currency: "usd",
      course_locale: courseLanguage,
    })
    .select("id")
    .single();
  if (error) throw error;

  if (paymentsMode() === "mock") {
    // Route handlers are not locale-prefixed.
    redirectTo(`/api/stripe/mock-checkout?order=${order.id}`);
  }

  const t = await getTranslations({ locale: uiLocale, namespace: "Courses" });
  const site = publicEnv.NEXT_PUBLIC_SITE_URL;
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: course.priceCents,
          product_data: { name: t("panel.title") },
        },
        quantity: 1,
      },
    ],
    customer_email: account.email,
    client_reference_id: account.userId,
    metadata: { order_id: order.id, course_locale: courseLanguage },
    allow_promotion_codes: true,
    success_url: new URL(
      getPathname({ href: "/portal?paid=1", locale: uiLocale }),
      site,
    ).toString(),
    cancel_url: new URL(
      getPathname({ href: portal, locale: uiLocale }),
      site,
    ).toString(),
  });
  await service
    .from("orders")
    .update({ stripe_session_id: session.id })
    .eq("id", order.id);
  if (!session.url) throw new Error("Stripe returned no checkout URL");
  redirectTo(session.url);
}
