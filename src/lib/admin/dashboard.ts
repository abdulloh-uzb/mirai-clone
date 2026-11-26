import "server-only";
import { createClient } from "@/lib/supabase/server";
import { dashboardStatsSchema } from "./dashboard-stats";
import { groupAttention, toStageCounts } from "./dashboard-view";

/** Everything the Admin Dashboard shows, read with the Admin's own session. Null when the stats are malformed. */
export async function loadDashboard() {
  const supabase = await createClient();
  const [stats, stages, attention, activity, recent] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.rpc("admin_stage_counts"),
    supabase.rpc("admin_attention_items", { p_limit: 5 }),
    supabase.rpc("admin_daily_activity", { p_days: 30 }),
    supabase.rpc("admin_search_students", { q: "", lim: 5, off: 0 }),
  ]);
  for (const { error } of [stats, stages, attention, activity, recent]) {
    if (error) throw new Error(`admin dashboard: ${error.message}`);
  }
  const parsed = dashboardStatsSchema.safeParse(stats.data);
  if (!parsed.success) return null;
  return {
    stats: parsed.data,
    stageCounts: toStageCounts(stages.data ?? []),
    attention: groupAttention(attention.data ?? []),
    activity: activity.data ?? [],
    recent: recent.data ?? [],
  };
}
