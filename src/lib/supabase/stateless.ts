import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../database.types";

/**
 * A Supabase client that keeps no session: no cookies, no storage, no token
 * refresh. For the anon key (public reads as a Visitor) and the service role.
 * It takes its settings as arguments so scripts and tests can use it without
 * loading the app's env module.
 */
export function createStatelessClient(
  url: string,
  key: string,
): SupabaseClient<Database> {
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
