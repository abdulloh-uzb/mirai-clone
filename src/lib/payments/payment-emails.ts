import "server-only";
import { getEmailSender } from "@/lib/email";
import { receiptEmail, welcomeEmail } from "@/lib/email/payment-templates";
import { languages } from "@/i18n/languages";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { formatUsd } from "@/lib/courses/courses";
import { publicEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";

/** Receipt and welcome emails for a paid order, in the Student's UI language. */
export async function sendPaymentEmails(orderId: string): Promise<void> {
  const service = createServiceClient();
  const { data: order, error } = await service
    .from("orders")
    .select("id, user_id, amount_cents, course_locale, created_at")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  const { data: profile } = await service
    .from("profiles")
    .select("first_name, preferred_locale")
    .eq("user_id", order.user_id)
    .single();
  const { data: authUser } = await service.auth.admin.getUserById(
    order.user_id,
  );
  const email = authUser.user?.email;
  if (!profile || !email) return;

  const locale = (routing.locales as readonly string[]).includes(
    profile.preferred_locale,
  )
    ? (profile.preferred_locale as Locale)
    : routing.defaultLocale;
  const courseLocale = (routing.locales as readonly string[]).includes(
    order.course_locale ?? "",
  )
    ? (order.course_locale as Locale)
    : routing.defaultLocale;
  const sender = getEmailSender();
  const portal = new URL(
    getPathname({ href: "/portal", locale }),
    publicEnv.NEXT_PUBLIC_SITE_URL,
  ).toString();

  await sender.send({
    to: email,
    ...receiptEmail({
      locale,
      name: profile.first_name,
      orderId: order.id,
      amount: formatUsd(order.amount_cents, locale),
      date: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(order.created_at),
      ),
    }),
  });
  await sender.send({
    to: email,
    ...welcomeEmail({
      locale,
      name: profile.first_name,
      language: languages[courseLocale].nativeName,
      url: portal,
    }),
  });
}
