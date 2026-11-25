import { createStatelessClient } from "../../src/lib/supabase/stateless";
import { testEnv } from "./env";

/** Bypasses RLS. Only for test setup and checks. */
export function serviceClient() {
  return createStatelessClient(
    testEnv.NEXT_PUBLIC_SUPABASE_URL,
    testEnv.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** A Visitor: the anon key with no signed-in user. */
export function visitorClient() {
  return createStatelessClient(
    testEnv.NEXT_PUBLIC_SUPABASE_URL,
    testEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
