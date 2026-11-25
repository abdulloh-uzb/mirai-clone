import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/database.types";
import { calculateRefund } from "@/lib/payments/refund";

// Account tools for the assistant. They take the signed-in user's client, so
// RLS scopes every read to that user. Never pass the service client here, and
// never read question-bank tables: the assistant has no access to them.

type Client = SupabaseClient<Database>;

export type NotEnrolled = { enrolled: false };

export type EnrollmentInfo =
  | NotEnrolled
  | {
      enrolled: true;
      status: string;
      courseLocale: string;
      startedAt: string | null;
      expiresAt: string | null;
      completedAt: string | null;
    };

export type ReportStatusInfo =
  | NotEnrolled
  | { enrolled: true; certificateIssued: false }
  | {
      enrolled: true;
      certificateIssued: true;
      reportStatus:
        "queued" | "sent" | "accepted" | "rejected" | "error" | null;
      updatedAt: string | null;
    };

export type RefundInfo =
  | NotEnrolled
  | {
      enrolled: true;
      eligible: boolean;
      pct: 0 | 50 | 100;
      amountCents: number;
      reason: string;
    };

export type DeadlineInfo =
  NotEnrolled | { enrolled: true; courtDueDate: string | null };

const reportStatusSchema = z.enum([
  "queued",
  "sent",
  "accepted",
  "rejected",
  "error",
]);

const factsSchema = z.object({
  paidAt: z.coerce.date(),
  amountCents: z.number(),
  status: z.string(),
  lessonsStarted: z.boolean(),
  examStarted: z.boolean(),
  certificateIssued: z.boolean(),
});

async function latestEnrollment(client: Client) {
  const { data, error } = await client
    .from("enrollments")
    .select(
      "id, order_id, status, course_locale, started_at, expires_at, completed_at, court_due_date",
    )
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type AccountTools = {
  getMyEnrollment: () => Promise<EnrollmentInfo>;
  getMyReportStatus: () => Promise<ReportStatusInfo>;
  getMyRefundEligibility: () => Promise<RefundInfo>;
  getMyCourtDeadline: () => Promise<DeadlineInfo>;
};

export function createAccountTools(client: Client): AccountTools {
  return {
    async getMyEnrollment() {
      const e = await latestEnrollment(client);
      if (!e) return { enrolled: false };
      return {
        enrolled: true,
        status: e.status,
        courseLocale: e.course_locale,
        startedAt: e.started_at,
        expiresAt: e.expires_at,
        completedAt: e.completed_at,
      };
    },

    async getMyReportStatus() {
      const e = await latestEnrollment(client);
      if (!e) return { enrolled: false };
      const { data: cert, error } = await client
        .from("certificates")
        .select("id")
        .eq("enrollment_id", e.id)
        .maybeSingle();
      if (error) throw error;
      if (!cert) return { enrolled: true, certificateIssued: false };
      const { data: report, error: reportError } = await client
        .from("completion_reports")
        .select("status, updated_at")
        .eq("certificate_id", cert.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (reportError) throw reportError;
      return {
        enrolled: true,
        certificateIssued: true,
        reportStatus: reportStatusSchema.safeParse(report?.status).data ?? null,
        updatedAt: report?.updated_at ?? null,
      };
    },

    async getMyRefundEligibility() {
      const e = await latestEnrollment(client);
      if (!e?.order_id) return { enrolled: false };
      const { data } = await client.rpc("refund_facts", {
        p_order_id: e.order_id,
      });
      const facts = factsSchema.safeParse(data);
      if (!facts.success) return { enrolled: false };
      const decision = calculateRefund(facts.data, facts.data, new Date());
      return {
        enrolled: true,
        eligible: decision.pct > 0,
        pct: decision.pct,
        amountCents: decision.amountCents,
        reason: decision.reason,
      };
    },

    async getMyCourtDeadline() {
      const e = await latestEnrollment(client);
      if (!e) return { enrolled: false };
      return { enrolled: true, courtDueDate: e.court_due_date };
    },
  };
}
