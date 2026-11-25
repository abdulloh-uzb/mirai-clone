import type { Locale } from "@/i18n/routing";
import { createAnonClient } from "@/lib/supabase/anon";

export type Announcement = { id: string; message: string };

/**
 * The newest published announcement for a UI language, or null when there is
 * none. Published rows are public (RLS), so this reads as a Visitor.
 */
export async function getPublishedAnnouncement(
  locale: Locale,
): Promise<Announcement | null> {
  const { data, error } = await createAnonClient()
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
