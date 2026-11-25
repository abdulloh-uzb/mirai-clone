// Rebuilds the assistant's knowledge base: pnpm ai:reindex
import { config } from "dotenv";
import { z } from "zod";
import { reindexKnowledgeBase } from "../src/lib/ai/kb";
import { createStatelessClient } from "../src/lib/supabase/stateless";

async function main() {
  config({ path: ".env.local", quiet: true });
  const env = z
    .object({
      NEXT_PUBLIC_SUPABASE_URL: z.url(),
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    })
    .parse(process.env);
  const client = createStatelessClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const count = await reindexKnowledgeBase(client);
  console.log(`Indexed ${count} chunks.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
