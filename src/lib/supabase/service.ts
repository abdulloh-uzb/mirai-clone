import "server-only";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/database.types";
import { publicEnv } from "@/lib/env";

/**
 * Supabase with the service role. Bypasses RLS, so use it only for trusted
 * server-side writes the user may not make themselves. Never import it into
 * client code: `server-only` makes that a build error.
 */
export function createServiceClient() {
  const serviceRoleKey = z
    .string()
    .min(1)
    .parse(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
