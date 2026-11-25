import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
  visitor,
  type TestUser,
} from "../support/users";

const tag = `wl-${randomUUID()}`;
const email = `${tag}@example.test`;
let student: TestUser;
let admin: TestUser;
let countyId = "";

beforeAll(async () => {
  [student, admin] = await Promise.all([signInAsStudent(), signInAsAdmin()]);
  const { data, error } = await serviceClient
    .from("counties")
    .select("id")
    .limit(1)
    .single();
  if (error) throw error;
  countyId = data.id;
  const state = await serviceClient
    .from("state_waitlist")
    .insert({ state_code: "TX", email });
  if (state.error) throw state.error;
  const classroom = await serviceClient
    .from("classroom_waitlist")
    .insert({ email, county_id: countyId, locale: "en" });
  if (classroom.error) throw classroom.error;
});

afterAll(async () => {
  await serviceClient.from("state_waitlist").delete().like("email", `%${tag}%`);
  await serviceClient
    .from("classroom_waitlist")
    .delete()
    .like("email", `%${tag}%`);
  await deleteTestUsers();
});

describe("seeded states and courses", () => {
  it("has 50 states and DC, with only California active", async () => {
    const { data, error } = await visitor()
      .from("states")
      .select("code, active");
    expect(error).toBeNull();
    expect(data).toHaveLength(51);
    expect(data?.filter((state) => state.active).map((s) => s.code)).toEqual([
      "CA",
    ]);
  });

  it("has an inactive classroom course at $124.99", async () => {
    const { data, error } = await visitor()
      .from("courses")
      .select("price_cents, list_price_cents, active")
      .eq("slug", "california-classroom-course")
      .single();
    expect(error).toBeNull();
    expect(data).toEqual({
      price_cents: 12499,
      list_price_cents: null,
      active: false,
    });
  });
});

describe("the waitlists", () => {
  it("cannot be read by a Visitor or a Student", async () => {
    for (const client of [visitor(), student.client]) {
      for (const table of ["state_waitlist", "classroom_waitlist"] as const) {
        const { data } = await client
          .from(table)
          .select("email")
          .eq("email", email);
        expect(data ?? []).toEqual([]);
      }
    }
  });

  it("cannot be written by a Visitor or a Student", async () => {
    for (const client of [visitor(), student.client]) {
      const state = await client
        .from("state_waitlist")
        .insert({ state_code: "NV", email: `x-${email}` });
      expect(state.error).not.toBeNull();
      const classroom = await client
        .from("classroom_waitlist")
        .insert({ county_id: countyId, email: `x-${email}`, locale: "en" });
      expect(classroom.error).not.toBeNull();
    }
  });

  it("are read by an Admin", async () => {
    for (const table of ["state_waitlist", "classroom_waitlist"] as const) {
      const { data, error } = await admin.client
        .from(table)
        .select("email")
        .eq("email", email);
      expect(error).toBeNull();
      expect(data).toEqual([{ email }]);
    }
  });
});
