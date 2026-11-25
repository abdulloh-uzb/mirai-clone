"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

const localeSchema = z.enum(routing.locales);

/**
 * Saves the UI language chosen in the switcher to the signed-in Student's
 * profile, so it follows them to other devices. For a Visitor it does nothing
 * (the switcher's cookie is their preference). RLS limits the update to the
 * caller's own profile.
 */
export async function saveUiLocale(input: unknown): Promise<void> {
  const parsed = localeSchema.safeParse(input);
  if (!parsed.success) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return;

  await supabase
    .from("profiles")
    .update({ preferred_locale: parsed.data })
    .eq("user_id", userId);
}
