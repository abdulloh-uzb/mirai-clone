import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type DriverDetailsRecord = {
  enrollmentId: string;
  legalName: string;
  dob: string;
  licenseNo: string;
  licenseState: string;
  phone: string;
  countySlug: string;
  citationNo: string;
  courtDueDate: string;
  securityQuestion: string;
  /** True once the legal name, date of birth and license number are locked. */
  locked: boolean;
  hasSecurityAnswer: boolean;
};

/** The signed-in Student's details for one enrollment, or null when it is not theirs. */
export async function getDriverDetails(
  enrollmentId: string,
): Promise<DriverDetailsRecord | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, citation_no, court_due_date, counties(slug)")
    .eq("id", enrollmentId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!enrollment) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "legal_name, dob, license_no, license_state, phone, details_locked_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile) return null;

  // security_questions has no client grants; read it with the service role,
  // scoped to the user id verified above. The answer hash is never selected.
  const { data: question } = await createServiceClient()
    .from("security_questions")
    .select("question")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    enrollmentId: enrollment.id,
    legalName: profile.legal_name ?? "",
    dob: profile.dob ?? "",
    licenseNo: profile.license_no ?? "",
    licenseState: profile.license_state ?? "CA",
    phone: profile.phone ?? "",
    countySlug: enrollment.counties?.slug ?? "",
    citationNo: enrollment.citation_no ?? "",
    courtDueDate: enrollment.court_due_date ?? "",
    securityQuestion: question?.question ?? "",
    locked: profile.details_locked_at !== null,
    hasSecurityAnswer: question !== null,
  };
}
