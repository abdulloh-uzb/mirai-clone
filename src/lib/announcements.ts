import { createClient } from "@supabase/supabase-js";
import type { Locale } from "@/i18n/routing";
import type { Database } from "@/lib/database.types";

export type Announcement = { id: string; message: string };

/**
 * The newest published announcement for a UI language, or null when there is
 * none. Published rows are public (RLS), so this reads as a Visitor.
 */
export async function getPublishedAnnouncement(
  locale: Locale,
): Promise<Announcement | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const supabase = createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("announcements")
    .select("id, message")
    .eq("locale", locale)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // The bar is decoration: if the database is unreachable, hide it.
  if (error) {
    console.error("Could not load the announcement", error.message);
    return null;
  }
  return data;
}
