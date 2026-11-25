import { z } from "zod";

// Public values, safe in the browser. Next.js inlines `NEXT_PUBLIC_*` only when
// each one is referenced by its full name, so they are listed one by one.
export const publicEnv = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL: z.url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  })
  .parse({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

/**
 * Whether search engines may index the site. Off unless `SITE_INDEXABLE=true`:
 * this is a demo with sample reviews and placeholder court data (phase 2 spec).
 * Read at call time so tests and deploys can flip it without a rebuild of this module.
 */
export function isSiteIndexable(): boolean {
  return process.env.SITE_INDEXABLE === "true";
}
