import { z } from "zod";

const windows = z.object({
  today: z.number(),
  d7: z.number(),
  d30: z.number(),
});

export const dashboardStatsSchema = z.object({
  sales_cents: windows,
  enrollments: windows,
  exam_submitted: z.number(),
  exam_passed: z.number(),
  avg_completion_seconds: z.number().nullable(),
  reports_by_status: z.record(z.string(), z.number()),
  refunds_30d: z.object({ count: z.number(), cents: z.number() }),
  ai_chats_7d: z.number(),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

/** Pass rate as a whole percent, or null before any exam was submitted. */
export function passRatePct(stats: DashboardStats): number | null {
  if (stats.exam_submitted === 0) return null;
  return Math.round((stats.exam_passed / stats.exam_submitted) * 100);
}

/** Average completion time in days (one decimal), or null with no completions. */
export function avgCompletionDays(stats: DashboardStats): number | null {
  if (stats.avg_completion_seconds === null) return null;
  return Math.round((stats.avg_completion_seconds / 86400) * 10) / 10;
}
