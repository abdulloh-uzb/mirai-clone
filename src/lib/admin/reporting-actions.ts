"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminWrite } from "@/lib/admin/admin-write";
import { runReportBatch } from "@/lib/reporting/run-batch";

// Admin server actions for the Reporting module. Every write goes through
// adminWrite (role check + audit_log).

const reason = z.string().trim().min(5).max(500);

const resendSchema = z.object({ reportId: z.uuid(), reason });

/** Puts a rejected or errored report back in the queue for the next batch. */
export async function resendReport(formData: FormData): Promise<void> {
  const parsed = resendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await adminWrite({
    action: "report.resend",
    entity: "completion_reports",
    entityId: parsed.data.reportId,
    reason: parsed.data.reason,
    run: async (service) => {
      const { error } = await service
        .from("completion_reports")
        .update({
          status: "queued",
          attempts: 0,
          next_attempt_at: null,
          error: null,
          rejected_at: null,
        })
        .eq("id", parsed.data.reportId);
      if (error) throw error;
    },
    after: () => ({ status: "queued", attempts: 0 }),
  });
  revalidatePath("/", "layout");
}

const citationSchema = z.object({
  enrollmentId: z.uuid(),
  citationNo: z.string().trim().min(1).max(64),
  reason,
});

/** Fixes the citation number on the enrollment (the usual cause of a rejection). */
export async function updateCitation(formData: FormData): Promise<void> {
  const parsed = citationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await adminWrite({
    action: "enrollment.citation",
    entity: "enrollments",
    entityId: parsed.data.enrollmentId,
    reason: parsed.data.reason,
    run: async (service) => {
      const { error } = await service
        .from("enrollments")
        .update({ citation_no: parsed.data.citationNo })
        .eq("id", parsed.data.enrollmentId);
      if (error) throw error;
    },
    after: () => ({ citation_no: parsed.data.citationNo }),
  });
  revalidatePath("/", "layout");
}

/** "Run batch now": the same batch the cron runs, audited. */
export async function runBatchNow(): Promise<void> {
  await adminWrite({
    action: "report.batch.run",
    entity: "report_batches",
    run: () => runReportBatch({ trigger: "manual" }),
    after: (counts) => counts,
  });
  revalidatePath("/", "layout");
}
