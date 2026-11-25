import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  DriverDetailsForm,
  type CountyOption,
} from "@/components/portal/driver-details-form";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { safeReturnPath } from "@/lib/auth/return-path";
import { getDriverDetails } from "@/lib/portal/details";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/details/[enrollmentId]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "DriverDetails" });
  return { title: t("title") };
}

// No personal details ever go in the URL: only the enrollment id (a path
// segment) and an optional same-site `?next=` path.
export default async function DriverDetailsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal/details/[enrollmentId]">) {
  const { locale, enrollmentId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const next = (await searchParams).next;
  const nextPath =
    safeReturnPath(typeof next === "string" ? next : null) ??
    getPathname({ href: "/portal", locale });

  const details = await getDriverDetails(enrollmentId);
  if (!details) notFound();

  const t = await getTranslations({ locale, namespace: "DriverDetails" });
  const supabase = await createClient();
  const { data: countyRows } = await supabase
    .from("counties")
    .select("slug, name, case_lookup_url")
    .eq("state_code", "CA")
    .order("name");
  const counties: CountyOption[] = (countyRows ?? []).map((row) => ({
    slug: row.slug,
    name: row.name,
    caseLookupUrl: row.case_lookup_url,
  }));

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 mb-8 text-muted-foreground">{t("intro")}</p>
      <DriverDetailsForm
        enrollmentId={details.enrollmentId}
        defaults={{
          legalName: details.legalName,
          dob: details.dob,
          licenseNo: details.licenseNo,
          licenseState: details.licenseState,
          phone: details.phone,
          countySlug: details.countySlug,
          citationNo: details.citationNo,
          courtDueDate: details.courtDueDate,
          securityQuestion: (details.securityQuestion ||
            "first_car") as "first_car",
          securityAnswer: "",
        }}
        counties={counties}
        locked={details.locked}
        hasSecurityAnswer={details.hasSecurityAnswer}
        nextPath={nextPath}
      />
    </section>
  );
}
