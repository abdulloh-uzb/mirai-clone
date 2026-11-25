import { config } from "dotenv";
import { z } from "zod";

// Tests read the same `.env.local` the app uses (see `.env.example`).
config({ path: ".env.local", quiet: true });

const testEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  MAILPIT_URL: z.url().default("http://127.0.0.1:54324"),
});

export const testEnv = testEnvSchema.parse(process.env);
