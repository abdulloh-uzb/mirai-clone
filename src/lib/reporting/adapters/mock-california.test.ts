import { describe, expect, it } from "vitest";
import { MockCaliforniaAdapter } from "./mock-california";
import type { CompletionPayload } from "../types";

const item = (reportId: string): CompletionPayload => ({
  reportId,
  certNo: "RR-2026-AAAAAAAA",
  legalName: "A B",
  dob: null,
  licenseNo: null,
  licenseState: null,
  courtCode: null,
  countyName: null,
  citationNo: null,
  completedAt: null,
});
const mk = (roll: number) =>
  new MockCaliforniaAdapter({
    random: () => roll,
    delay: async () => {},
    alwaysAccept: false,
  });

describe("MockCaliforniaAdapter", () => {
  it("sends with a CA-MOCK reference", async () => {
    const [r] = await mk(0.5).submitCompletions([item("1")]);
    expect(r.status).toBe("sent");
    expect(r.regulatorRef).toMatch(/^CA-MOCK-[0-9A-F]{6}$/);
  });
  it("rejects about 5% and errors about 5%", async () => {
    expect((await mk(0.01).submitCompletions([item("1")]))[0]).toMatchObject({
      status: "rejected",
      reason: "Citation not found",
    });
    expect((await mk(0.07).submitCompletions([item("1")]))[0].status).toBe(
      "error",
    );
  });
  it("confirms sent reports, rejecting some", async () => {
    expect((await mk(0.5).checkStatus(["1"]))[0].status).toBe("accepted");
    expect((await mk(0.95).checkStatus(["1"]))[0].status).toBe("rejected");
  });
  it("always accepts when asked", async () => {
    const a = new MockCaliforniaAdapter({
      random: () => 0,
      delay: async () => {},
      alwaysAccept: true,
    });
    expect((await a.submitCompletions([item("1")]))[0].status).toBe("sent");
    expect((await a.checkStatus(["1"]))[0].status).toBe("accepted");
  });
});
