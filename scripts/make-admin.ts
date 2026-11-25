// Admin seed script: makes an existing account an Admin by email.
//
//   pnpm db:make-admin someone@example.com
//
// It runs with the service role (SUPABASE_SERVICE_ROLE_KEY from `.env.local`)
// and refuses an email with no account. This is the only way to create the
// first Admin: no client role can change a role or call `make_admin`.
import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import type { Database } from "../src/lib/database.types";
import { createStatelessClient } from "../src/lib/supabase/stateless";

export async function makeAdmin(
  client: SupabaseClient<Database>,
  email: string,
): Promise<string> {
  const { data, error } = await client.rpc("make_admin", {
    target_email: email,
  });
  if (error) throw new Error(error.message);
  return data;
}

async function main() {
  config({ path: ".env.local", quiet: true });
  const env = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    })
    .parse(process.env);
  const email = z.email().parse(process.argv[2]?.trim());

  const service = createStatelessClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  await makeAdmin(service, email);
  console.log(`${email} is now an Admin.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
