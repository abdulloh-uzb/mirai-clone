import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const run = vi.hoisted(() => vi.fn(async () => ({ sent: 1 })));
const secret = vi.hoisted(() => ({ value: undefined as string | undefined }));
vi.mock("@/lib/reporting/run-batch", () => ({ runReportBatch: run }));
vi.mock("@/lib/reporting/env", () => ({
  reportingEnv: () => ({ cronSecret: secret.value, alwaysAccept: false }),
}));

import { GET } from "./route";

const req = (qs = "", auth?: string) =>
  new Request(`http://x/api/cron/report-batch${qs}`, {
    headers: auth ? { authorization: auth } : {},
  });

describe("report-batch cron route", () => {
  beforeEach(() => {
    run.mockClear();
    secret.value = "s3cret";
  });
  afterEach(() => {
    vi.useRealTimers();
    secret.value = undefined;
  });

  it("rejects a missing or wrong secret, and an unset CRON_SECRET", async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req("", "Bearer nope"))).status).toBe(401);
    secret.value = undefined;
    expect((await GET(req("", "Bearer undefined"))).status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("skips outside a reporting slot", async () => {
    vi.useFakeTimers({ now: new Date("2026-07-15T17:00:00Z") });
    const res = await GET(req("", "Bearer s3cret"));
    expect(await res.json()).toEqual({ skipped: true });
    expect(run).not.toHaveBeenCalled();
  });

  it("runs in a slot, and with force", async () => {
    vi.useFakeTimers({ now: new Date("2026-07-15T16:00:00Z") });
    expect((await GET(req("", "Bearer s3cret"))).status).toBe(200);
    expect(run).toHaveBeenCalledTimes(1);
    vi.setSystemTime(new Date("2026-07-15T17:00:00Z"));
    await GET(req("?force=1", "Bearer s3cret"));
    expect(run).toHaveBeenCalledTimes(2);
  });
});
