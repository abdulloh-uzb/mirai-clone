import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ReportSummary = {
  status: "queued" | "sent" | "accepted" | "rejected" | "error";
  passedAt: string | null;
  queuedAt: string;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  courtNotifiedAt: string | null;
};

const STATUSES = ["queued", "sent", "accepted", "rejected", "error"] as const;

/**
 * The Student's own report for an enrollment (RLS applies), or null when no
 * certificate or report exists yet. Never reads regulator_ref or error.
 */
export async function getReportSummary(
  enrollmentId: string,
): Promise<ReportSummary | null> {
  const supabase = await createClient();
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select(
      "completed_at, certificates(completion_reports(status, created_at, sent_at, accepted_at, rejected_at, court_notified_at))",
    )
    .eq("id", enrollmentId)
    .maybeSingle();
  const cert = Array.isArray(enrollment?.certificates)
    ? enrollment.certificates[0]
    : enrollment?.certificates;
  const reports = cert?.completion_reports;
  const report = Array.isArray(reports) ? reports[0] : reports;
  if (!enrollment || !report) return null;
  const status = STATUSES.find((s) => s === report.status);
  if (!status) return null;
  return {
    status,
    passedAt: enrollment.completed_at,
    queuedAt: report.created_at,
    sentAt: report.sent_at,
    acceptedAt: report.accepted_at,
    rejectedAt: report.rejected_at,
    courtNotifiedAt: report.court_notified_at,
  };
}
