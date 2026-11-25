import { publicEnv } from "@/lib/env";
import { createStatelessClient } from "@/lib/supabase/stateless";

/** Supabase as a Visitor with no session. RLS applies; use it for public reads. */
export function createAnonClient() {
  return createStatelessClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
