// Runs one completion-reporting batch by hand (ignores the reporting slots).
//
//   pnpm report:run
//
// Uses the service role from `.env.local` and the mock California adapter.
// Set MOCK_REPORTING_ALWAYS_ACCEPT=1 for a deterministic run.
import { config } from "dotenv";
import { z } from "zod";
import { createStatelessClient } from "../src/lib/supabase/stateless";
import { adapterFor } from "../src/lib/reporting/adapters";
import { runBatch } from "../src/lib/reporting/run-batch-core";

async function main() {
  config({ path: ".env.local", quiet: true });
  const env = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    })
    .parse(process.env);
  const service = createStatelessClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  // No status emails from the script.
  const counts = await runBatch(
    { service, adapterFor },
    { trigger: "manual", now: new Date() },
  );
  console.log(JSON.stringify(counts));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
