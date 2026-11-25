import "server-only";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { createStatelessClient } from "@/lib/supabase/stateless";

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
  return createStatelessClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey,
  );
}
