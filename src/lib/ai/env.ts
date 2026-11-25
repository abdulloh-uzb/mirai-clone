import "server-only";

/** Server-only settings of the assistant, read at call time. */
export function aiEnv() {
  return {
    /** No key = the offline responder answers. */
    apiKey: process.env.AI_API_KEY || undefined,
    model: process.env.AI_MODEL || "claude-haiku-5-5",
    // Salt for IP hashes; any server secret works.
    ipSalt: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  };
}
