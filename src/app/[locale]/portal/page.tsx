import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Dashboard } from "@/components/portal/dashboard";
import { PaymentPending } from "@/components/portal/payment-pending";
import { PurchasePanel } from "@/components/portal/purchase-panel";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { parseCourseLanguage } from "@/lib/courses/course-language";
import {
  getCourseOutline,
  getCurrentEnrollment,
} from "@/lib/portal/enrollment";
import { createClient } from "@/lib/supabase/server";
import { currentEnrollmentId } from "@/lib/payments/enrollment-status";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Portal" });
  return { title: t("title") };
}

// Minimal Portal. A Student with no enrollment sees the purchase panel (or
// "Confirming payment" after checkout). Neither creates an enrollment: only the
// payment event handler does. Ticket 03 replaces the enrolled card with the
// real dashboard.
export default async function PortalPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, tc, account, query] = await Promise.all([
    getTranslations({ locale, namespace: "Portal" }),
    getTranslations({ locale, namespace: "Checkout" }),
    getCurrentAccount(),
    searchParams,
  ]);
  if (!account) notFound();

  // Ticket 03: an enrolled Student sees the course dashboard.
  const enrollment = await getCurrentEnrollment();
  if (enrollment) {
    const supabase = await createClient();
    const now = new Date();
    if (
      enrollment.status === "active" &&
      enrollment.expiresAt &&
      new Date(enrollment.expiresAt) < now
    ) {
      await supabase.rpc("expire_enrollment_if_due", {
        p_enrollment_id: enrollment.id,
      });
      enrollment.status = "expired";
    }
    const [outline, details] = await Promise.all([
      getCourseOutline(enrollment),
      supabase.rpc("has_driver_details", { p_enrollment_id: enrollment.id }),
    ]);
    return (
      <Dashboard
        locale={locale}
        enrollment={enrollment}
        outline={outline}
        hasDetails={details.data === true}
        now={now}
      />
    );
  }

  const enrollmentId = await currentEnrollmentId(account.userId);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <Link
          href="/portal/orders"
          className="font-medium text-primary hover:underline"
        >
          {t("ordersLink")}
        </Link>
      </div>
      <div className="mt-8">
        {enrollmentId ? (
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold">{tc("enrolledTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{tc("enrolledText")}</p>
            <Link
              href={`/portal/details/${enrollmentId}`}
              className={buttonVariants({ className: "mt-4" })}
            >
              {tc("enterDetails")}
            </Link>
          </div>
        ) : query.paid === "1" ? (
          <PaymentPending />
        ) : (
          <PurchasePanel
            courseLanguage={parseCourseLanguage(query.course) ?? locale}
            locale={locale}
            verifyEmailError={query.error === "verifyEmail"}
          />
        )}
      </div>
    </section>
  );
}
