import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { languages } from "@/i18n/languages";
import { routing } from "@/i18n/routing";
import { Dashboard } from "@/components/portal/dashboard";
import {
  getCourseOutline,
  getCurrentEnrollment,
} from "@/lib/portal/enrollment";
import { createClient } from "@/lib/supabase/server";
import { parseCourseLanguage } from "@/lib/courses/course-language";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Portal" });
  return { title: t("title") };
}

// Placeholder Portal. Courses, certificates and the profile arrive in later
// phases. `?course=` comes from a buy button; it never creates an enrollment
// (only the Stripe webhook does, in phase 4).
export default async function PortalPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Portal" });
  const course = parseCourseLanguage((await searchParams).course);

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

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      {course ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3"
        >
          {t("paymentsSoon", { language: languages[course].nativeName })}
        </p>
      ) : null}
      <p className="mt-4 text-muted-foreground">{t("empty")}</p>
    </section>
  );
}
