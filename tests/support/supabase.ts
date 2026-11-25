import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import type { Database } from "@/lib/database.types";

// Tests read the same `.env.local` the app uses (fill it from `pnpm db:env`).
config({ path: ".env.local", quiet: true });

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set; see .env.example`);
  return value;
}

const options = { auth: { persistSession: false, autoRefreshToken: false } };

/** Bypasses RLS. Only for test setup and checks. */
export function serviceClient() {
  return createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("SUPABASE_SERVICE_ROLE_KEY"),
    options,
  );
}

/** A Visitor: the anon key with no signed-in user. */
export function visitorClient() {
  return createClient<Database>(
    env("NEXT_PUBLIC_SUPABASE_URL"),
    env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    options,
  );
}
