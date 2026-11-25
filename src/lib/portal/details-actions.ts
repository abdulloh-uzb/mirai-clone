"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAccount } from "@/lib/auth/current-account";
import type { PublicFormResult } from "@/lib/forms/public-form";
import { getDriverDetails } from "@/lib/portal/details";
import { createClient } from "@/lib/supabase/server";
import { makeDriverDetailsSchema } from "@/lib/validation/driver-details";
import { isFormMessageKey, type FieldErrorKey } from "@/lib/validation/support";

// Saves the driver/court details through `save_driver_details`, which owns
// the checks (ownership, lock, county citation format). The DB raises
// field-named messages that are mapped back to form fields here.

const DB_FIELD_ERRORS: { match: RegExp; field: string; key: FieldErrorKey }[] =
  [
    { match: /details are locked/, field: "legalName", key: "detailsLocked" },
    {
      match: /citation_no does not match/,
      field: "citationNo",
      key: "citationCounty",
    },
    { match: /citation_no/, field: "citationNo", key: "citationFormat" },
    { match: /court_due_date/, field: "courtDueDate", key: "dueDatePast" },
    { match: /county_id/, field: "countySlug", key: "countyInvalid" },
    {
      match: /security_answer/,
      field: "securityAnswer",
      key: "securityAnswerShort",
    },
    {
      match: /security_question/,
      field: "securityQuestion",
      key: "securityQuestionInvalid",
    },
    { match: /dob/, field: "dob", key: "dobAge" },
    { match: /license/, field: "licenseNo", key: "licenseFormat" },
    { match: /phone/, field: "phone", key: "phoneInvalid" },
  ];

export async function saveDriverDetails(
  enrollmentId: string,
  input: unknown,
): Promise<PublicFormResult> {
  const account = await getCurrentAccount();
  if (!account) return { status: "error", formError: "generic" };

  const existing = await getDriverDetails(enrollmentId);
  if (!existing) return { status: "error", formError: "generic" };

  const parsed = makeDriverDetailsSchema({
    requireSecurityAnswer: !existing.hasSecurityAnswer,
  }).safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, FieldErrorKey> = {};
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "form");
      if (isFormMessageKey(issue.message)) {
        fieldErrors[field] ??= issue.message as FieldErrorKey;
      }
    }
    return { status: "error", fieldErrors };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { data: county } = await supabase
    .from("counties")
    .select("id")
    .eq("slug", data.countySlug)
    .maybeSingle();
  if (!county) {
    return { status: "error", fieldErrors: { countySlug: "countyInvalid" } };
  }

  const { error } = await supabase.rpc("save_driver_details", {
    p_enrollment_id: enrollmentId,
    p_legal_name: data.legalName,
    p_dob: data.dob,
    p_license_no: data.licenseNo,
    p_license_state: data.licenseState,
    p_phone: data.phone,
    p_county_id: county.id,
    p_citation_no: data.citationNo,
    p_court_due_date: data.courtDueDate,
    p_security_question: data.securityQuestion,
    p_security_answer: data.securityAnswer,
  });
  if (error) {
    const hit = DB_FIELD_ERRORS.find((rule) => rule.match.test(error.message));
    if (hit && (error.code === "23514" || error.code === "42501")) {
      return { status: "error", fieldErrors: { [hit.field]: hit.key } };
    }
    return { status: "error", formError: "generic" };
  }

  revalidatePath("/", "layout");
  return { status: "ok" };
}
