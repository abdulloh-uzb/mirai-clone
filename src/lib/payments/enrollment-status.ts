import "server-only";
import { createClient } from "@/lib/supabase/server";

/** The statuses that mean the Student already has the course (spec section 8). */
export const OWNED_STATUSES = [
  "active",
  "paused",
  "locked",
  "completed",
] as const;

/** The signed-in Student's current enrollment id, if any (own RLS read). */
export async function currentEnrollmentId(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .in("status", [...OWNED_STATUSES])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}
