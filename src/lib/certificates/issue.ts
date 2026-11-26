import "server-only";
import { languages } from "@/i18n/languages";
import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getEmailSender } from "@/lib/email";
import { certificateReadyEmail } from "@/lib/email/certificate-templates";
import { publicEnv } from "@/lib/env";
import { createServiceClient } from "@/lib/supabase/service";
import { maskLicense } from "./mask";
import { renderCertificatePdf } from "./pdf";

const asLocale = (value: string | null | undefined): Locale =>
  (routing.locales as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : routing.defaultLocale;

/**
 * Issues the certificate for a completed enrollment and makes sure its PDF is
 * stored. Safe to call again: the certificate is created once and the PDF is
 * only rendered while `pdf_path` is empty. Returns the certificate number.
 */
export async function issueCertificateFor(
  enrollmentId: string,
): Promise<string> {
  const service = createServiceClient();
  const { data: cert, error } = await service.rpc("issue_certificate", {
    p_enrollment_id: enrollmentId,
  });
  if (error) throw error;
  if (cert.pdf_path) return cert.cert_no;

  const { data: enrollment, error: enrollmentError } = await service
    .from("enrollments")
    .select("user_id, citation_no, course_locale, completed_at, counties(name)")
    .eq("id", enrollmentId)
    .single();
  if (enrollmentError) throw enrollmentError;
  const { data: profile, error: profileError } = await service
    .from("profiles")
    .select("first_name, last_name, legal_name, license_no, preferred_locale")
    .eq("user_id", enrollment.user_id)
    .single();
  if (profileError) throw profileError;

  const courseLocale = asLocale(enrollment.course_locale);
  const county = enrollment.counties?.name;
  const pdf = await renderCertificatePdf({
    legalName:
      profile.legal_name ?? `${profile.first_name} ${profile.last_name}`,
    maskedLicense: profile.license_no ? maskLicense(profile.license_no) : "-",
    court: county ? `${county} County Superior Court` : "-",
    citationNo: enrollment.citation_no ?? "-",
    completedOn: (enrollment.completed_at ?? cert.issued_at).slice(0, 10),
    certNo: cert.cert_no,
    locale: courseLocale,
    courseLanguage: languages[courseLocale].nativeName,
    verifyUrl: new URL(
      `/verify/${cert.cert_no}`,
      publicEnv.NEXT_PUBLIC_SITE_URL,
    ).toString(),
  });

  const path = `${enrollment.user_id}/${cert.cert_no}.pdf`;
  const { error: uploadError } = await service.storage
    .from("certificates")
    .upload(path, pdf, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw uploadError;
  const { error: updateError } = await service
    .from("certificates")
    .update({ pdf_path: path })
    .eq("id", cert.id);
  if (updateError) throw updateError;

  await sendReadyEmail(enrollment.user_id, profile, cert.cert_no).catch((e) =>
    console.error("certificate email failed", e),
  );
  return cert.cert_no;
}

async function sendReadyEmail(
  userId: string,
  profile: { first_name: string; preferred_locale: string },
  certNo: string,
): Promise<void> {
  const { data } = await createServiceClient().auth.admin.getUserById(userId);
  const to = data.user?.email;
  if (!to) return;
  const locale = asLocale(profile.preferred_locale);
  await getEmailSender().send({
    to,
    ...certificateReadyEmail({
      locale,
      name: profile.first_name,
      certNo,
      url: new URL(
        getPathname({ href: "/portal/certificates", locale }),
        publicEnv.NEXT_PUBLIC_SITE_URL,
      ).toString(),
    }),
  });
}
