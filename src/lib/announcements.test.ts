import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("getPublishedAnnouncement", () => {
  it("fails loudly when the Supabase settings are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    await expect(async () => {
      const { getPublishedAnnouncement } = await import("./announcements");
      await getPublishedAnnouncement("en");
    }).rejects.toThrow();
  });
});
