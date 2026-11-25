"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminWrite, requireAdmin } from "@/lib/admin/admin-write";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Admin server actions for Students and Enrollments. Each one re-checks the
// role on the server (requireAdmin / adminWrite) and writes audit_log.

const reason = z.string().trim().min(5).max(500);
const locales = z.enum(["en", "ja", "es", "ru"]);

async function loadEnrollment(id: string) {
  await requireAdmin();
  const { data } = await createServiceClient()
    .from("enrollments")
    .select("id, status, expires_at, started_at, course_locale, exam_resets")
    .eq("id", id)
    .single();
  return data;
}

const lockedSchema = z.object({
  userId: z.uuid(),
  legalName: z.string().trim().min(1).max(200),
  dob: z.iso.date(),
  licenseNo: z.string().trim().min(1).max(32),
  reason,
});

/** Locked fields: the SQL function checks the role, needs a reason, and audits. */
export async function updateLockedDetails(formData: FormData): Promise<void> {
  const parsed = lockedSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_locked_details", {
    p_user_id: parsed.data.userId,
    p_legal_name: parsed.data.legalName,
    p_dob: parsed.data.dob,
    p_license_no: parsed.data.licenseNo,
    p_reason: parsed.data.reason,
  });
  if (error) throw error;
  revalidatePath("/", "layout");
}

const contactSchema = z.object({
  userId: z.uuid(),
  phone: z.string().trim().max(40),
  reason,
});

export async function updateContact(formData: FormData): Promise<void> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await requireAdmin();
  const { data: before } = await createServiceClient()
    .from("profiles")
    .select("id, phone")
    .eq("user_id", parsed.data.userId)
    .single();
  if (!before) return;
  await adminWrite({
    action: "profile.update_contact",
    entity: "profiles",
    entityId: before.id,
    before: { phone: before.phone },
    reason: parsed.data.reason,
    run: async (svc) => {
      const { error } = await svc
        .from("profiles")
        .update({ phone: parsed.data.phone || null })
        .eq("user_id", parsed.data.userId);
      if (error) throw error;
      return { phone: parsed.data.phone || null };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

const extendSchema = z.object({
  enrollmentId: z.uuid(),
  days: z.coerce.number().int().min(1).max(365),
  reason,
});

/** Extend access by N days from the later of now and the current expiry. */
export async function extendAccess(formData: FormData): Promise<void> {
  const parsed = extendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const before = await loadEnrollment(parsed.data.enrollmentId);
  if (!before) return;
  const base = Math.max(
    Date.now(),
    before.expires_at ? new Date(before.expires_at).getTime() : 0,
  );
  const expiresAt = new Date(
    base + parsed.data.days * 24 * 60 * 60 * 1000,
  ).toISOString();
  await adminWrite({
    action: "enrollment.extend",
    entity: "enrollments",
    entityId: before.id,
    before: { expires_at: before.expires_at, status: before.status },
    reason: parsed.data.reason,
    run: async (svc) => {
      // An expired enrollment becomes usable again once extended.
      const status = before.status === "expired" ? "active" : before.status;
      const { error } = await svc
        .from("enrollments")
        .update({ expires_at: expiresAt, status })
        .eq("id", before.id);
      if (error) throw error;
      return { expires_at: expiresAt, status, days: parsed.data.days };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

const resetSchema = z.object({ enrollmentId: z.uuid(), reason });

/**
 * One more round of final-exam attempts. Free for now.
 * TODO(spec): the paid exam_reset product is not wired here.
 */
export async function grantExamReset(formData: FormData): Promise<void> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const before = await loadEnrollment(parsed.data.enrollmentId);
  if (!before) return;
  await adminWrite({
    action: "enrollment.exam_reset",
    entity: "enrollments",
    entityId: before.id,
    before: { exam_resets: before.exam_resets, status: before.status },
    reason: parsed.data.reason,
    run: async (svc) => {
      const status = before.status === "locked" ? "active" : before.status;
      const { error } = await svc
        .from("enrollments")
        .update({ exam_resets: before.exam_resets + 1, status })
        .eq("id", before.id);
      if (error) throw error;
      return { exam_resets: before.exam_resets + 1, status };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

const lockSchema = z.object({
  enrollmentId: z.uuid(),
  to: z.enum(["lock", "unlock"]),
  reason,
});

/** Lock an active or paused enrollment, or unlock a locked or paused one. */
export async function setEnrollmentLock(formData: FormData): Promise<void> {
  const parsed = lockSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const before = await loadEnrollment(parsed.data.enrollmentId);
  if (!before) return;
  const allowed =
    parsed.data.to === "lock" ? ["active", "paused"] : ["locked", "paused"];
  if (!allowed.includes(before.status)) return;
  const status = parsed.data.to === "lock" ? "locked" : "active";
  await adminWrite({
    action: `enrollment.${parsed.data.to}`,
    entity: "enrollments",
    entityId: before.id,
    before: { status: before.status },
    reason: parsed.data.reason,
    run: async (svc) => {
      const { error } = await svc
        .from("enrollments")
        .update({ status })
        .eq("id", before.id);
      if (error) throw error;
      return { status };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

const languageSchema = z.object({
  enrollmentId: z.uuid(),
  courseLocale: locales,
  reason,
});

/** Only before the course has started. */
export async function changeCourseLanguage(formData: FormData): Promise<void> {
  const parsed = languageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const before = await loadEnrollment(parsed.data.enrollmentId);
  if (!before || before.started_at) return;
  await adminWrite({
    action: "enrollment.change_language",
    entity: "enrollments",
    entityId: before.id,
    before: { course_locale: before.course_locale },
    reason: parsed.data.reason,
    run: async (svc) => {
      const { error } = await svc
        .from("enrollments")
        .update({ course_locale: parsed.data.courseLocale })
        .eq("id", before.id)
        .is("started_at", null);
      if (error) throw error;
      return { course_locale: parsed.data.courseLocale };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}
