/** Server-only reporting settings, read at call time. */
export function reportingEnv() {
  return {
    cronSecret: process.env.CRON_SECRET || undefined,
    // Makes the mock DMV deterministic for the demo and tests.
    alwaysAccept: process.env.MOCK_REPORTING_ALWAYS_ACCEPT === "1",
  };
}
