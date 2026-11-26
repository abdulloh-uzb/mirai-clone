import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "./csp";

const base = {
  nonce: "abc",
  isDev: false,
  supabaseUrl: "https://x.supabase.co",
  posthogHost: "https://us.i.posthog.com",
};

describe("buildCsp", () => {
  it("allows scripts only by nonce, never unsafe-inline", () => {
    const script = buildCsp(base)
      .split("; ")
      .find((d) => d.startsWith("script-src"));
    expect(script).toContain("'nonce-abc'");
    expect(script).toContain("'strict-dynamic'");
    expect(script).not.toContain("'unsafe-inline'");
    expect(script).not.toContain("'unsafe-eval'");
  });

  it("allows eval and websockets in dev only", () => {
    const csp = buildCsp({ ...base, isDev: true });
    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain(" ws:");
  });

  it("adds the Sentry ingest origin when a DSN is set", () => {
    const csp = buildCsp({
      ...base,
      sentryDsn: "https://key@o1.ingest.sentry.io/42",
    });
    expect(csp).toContain("https://o1.ingest.sentry.io");
    expect(buildCsp(base)).not.toContain("sentry");
  });

  it("makes a fresh nonce each time", () => {
    expect(createNonce()).not.toBe(createNonce());
  });
});
