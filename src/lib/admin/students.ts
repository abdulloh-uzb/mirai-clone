import "server-only";
import { progressPct } from "@/lib/course/outline";
import { getCourseOutline } from "@/lib/portal/enrollment";
import { requireAdmin } from "@/lib/admin/admin-write";
import { createServiceClient } from "@/lib/supabase/service";

/** Everything the Admin Student page shows. Admin only (service client). */
export async function loadStudent(userId: string) {
  await requireAdmin();
  const svc = createServiceClient();
  const { data: profile } = await svc
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (!profile) return null;

  const [{ data: authUser }, { data: enrollments }, { data: orders }] =
    await Promise.all([
      svc.auth.admin.getUserById(userId),
      svc
        .from("enrollments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      svc
        .from("orders")
        .select("id, product, amount_cents, status, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);
  const enrollmentIds = (enrollments ?? []).map((e) => e.id);
  const orderIds = (orders ?? []).map((o) => o.id);

  const [quizzes, exams, checks, refunds, audit] = await Promise.all([
    svc
      .from("quiz_attempts")
      .select("id, enrollment_id, section_id, score, passed, submitted_at")
      .in("enrollment_id", enrollmentIds)
      .order("started_at", { ascending: false }),
    svc
      .from("exam_attempts")
      .select("id, enrollment_id, score, passed, started_at, submitted_at")
      .in("enrollment_id", enrollmentIds)
      .order("started_at", { ascending: false }),
    svc
      .from("identity_checks")
      .select("id, enrollment_id, question_key, correct, asked_at")
      .in("enrollment_id", enrollmentIds)
      .order("asked_at", { ascending: false }),
    svc
      .from("refunds")
      .select("id, order_id, amount_cents, pct, status, created_at")
      .in("order_id", orderIds)
      .order("created_at", { ascending: false }),
    svc
      .from("audit_log")
      .select("id, action, entity, before, after, created_at")
      .in("entity_id", [profile.id, ...enrollmentIds])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const progress = await Promise.all(
    (enrollments ?? []).map(async (e) => ({
      id: e.id,
      pct: progressPct(
        await getCourseOutline(
          { id: e.id, courseId: e.course_id, courseLocale: e.course_locale },
          svc,
        ),
      ),
    })),
  );

  return {
    profile,
    email: authUser.user?.email ?? "",
    enrollments: enrollments ?? [],
    progress: Object.fromEntries(progress.map((p) => [p.id, p.pct])),
    orders: orders ?? [],
    quizzes: quizzes.data ?? [],
    exams: exams.data ?? [],
    checks: checks.data ?? [],
    refunds: refunds.data ?? [],
    audit: audit.data ?? [],
  };
}
