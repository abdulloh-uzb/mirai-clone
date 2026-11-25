import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { serviceClient, visitorClient } from "../support/supabase";
import { deleteTestUsers, signInAsStudent } from "../support/users";

afterAll(deleteTestUsers);

const service = serviceClient();
const hit = (key: string, max: number, windowSeconds: number) =>
  service.rpc("hit_rate_limit", {
    key,
    max,
    window_seconds: windowSeconds,
  });
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("hit_rate_limit", () => {
  it("allows up to the maximum, then blocks, then resets in a new window", async () => {
    const key = `test:${randomUUID()}`;
    // Start just after a 2 s window boundary so the three hits share a window.
    await sleep(2000 - (Date.now() % 2000) + 20);
    const results = [
      (await hit(key, 2, 2)).data,
      (await hit(key, 2, 2)).data,
      (await hit(key, 2, 2)).data,
    ];
    expect(results).toEqual([true, true, false]);

    await sleep(2100);
    expect((await hit(key, 2, 2)).data).toBe(true);
  });

  it("counts each key separately", async () => {
    const a = `test:${randomUUID()}`;
    const b = `test:${randomUUID()}`;
    expect((await hit(a, 1, 600)).data).toBe(true);
    expect((await hit(a, 1, 600)).data).toBe(false);
    expect((await hit(b, 1, 600)).data).toBe(true);
  });

  it("rejects a maximum or window below 1", async () => {
    expect((await hit(`test:${randomUUID()}`, 0, 10)).error).not.toBeNull();
    expect((await hit(`test:${randomUUID()}`, 1, 0)).error).not.toBeNull();
  });

  it("cannot be called by a Visitor or a Student", async () => {
    const args = { key: `test:${randomUUID()}`, max: 5, window_seconds: 60 };
    const asVisitor = await visitorClient().rpc("hit_rate_limit", args);
    expect(asVisitor.error).not.toBeNull();
    const student = await signInAsStudent();
    const asStudent = await student.client.rpc("hit_rate_limit", args);
    expect(asStudent.error).not.toBeNull();
  });
});
