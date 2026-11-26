import { NextResponse } from "next/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { reportError } from "@/lib/observability/report-error";
import { buildExport } from "@/lib/privacy/export";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/** "Download my data": the signed-in user's own records as JSON. Reads use the user's client (RLS). */
export async function GET() {
  const account = await getCurrentAccount();
  if (!account) return new NextResponse(null, { status: 401 });
  try {
    const supabase = await createClient();
    const uid = account.userId;
    const [profile, enrollments, orders, aiConversations] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("enrollments").select("*").eq("user_id", uid),
      supabase.from("orders").select("*").eq("user_id", uid),
      supabase.from("ai_conversations").select("*").eq("user_id", uid),
    ]);
    const enrollmentIds = (enrollments.data ?? []).map((e) => e.id);
    const [certificates, examAttempts, quizAttempts] = await Promise.all([
      supabase
        .from("certificates")
        .select("*")
        .in("enrollment_id", enrollmentIds),
      supabase
        .from("exam_attempts")
        .select(
          "id, enrollment_id, attempt_no, score, passed, started_at, submitted_at",
        )
        .in("enrollment_id", enrollmentIds),
      supabase
        .from("quiz_attempts")
        .select(
          "id, enrollment_id, section_id, score, passed, started_at, submitted_at",
        )
        .in("enrollment_id", enrollmentIds),
    ]);
    const certificateIds = (certificates.data ?? []).map((c) => c.id);
    // Tickets and report status are not readable by the user client; the
    // server filters by the verified user id.
    const service = createServiceClient();
    const [tickets, reports] = await Promise.all([
      service
        .from("tickets")
        .select("id, type, status, body, created_at")
        .eq("user_id", uid),
      service
        .from("completion_reports")
        .select("id, certificate_id, status, created_at, updated_at")
        .in("certificate_id", certificateIds),
    ]);

    const payload = buildExport({
      profile: profile.data,
      enrollments: enrollments.data ?? [],
      orders: orders.data ?? [],
      examAttempts: examAttempts.data ?? [],
      quizAttempts: quizAttempts.data ?? [],
      certificates: certificates.data ?? [],
      reports: reports.data ?? [],
      tickets: tickets.data ?? [],
      aiConversations: aiConversations.data ?? [],
    });
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="my-data.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    reportError("portal export", error);
    return new NextResponse(null, { status: 500 });
  }
}
