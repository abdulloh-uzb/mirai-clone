import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
  type TestUser,
} from "../support/users";

afterAll(deleteTestUsers);

let countyId: string;

beforeAll(async () => {
  const { data, error } = await serviceClient
    .from("counties")
    .select("id")
    .limit(1)
    .single();
  if (error) throw error;
  countyId = data.id;
});

async function enrollmentFor(user: TestUser) {
  const { data: course, error: courseError } = await serviceClient
    .from("courses")
    .select("id")
    .limit(1)
    .single();
  if (courseError) throw courseError;
  const { data, error } = await serviceClient
    .from("enrollments")
    .insert({ user_id: user.id, course_id: course.id, course_locale: "en" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

const future = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
};

function args(enrollmentId: string, overrides: Record<string, unknown> = {}) {
  return {
    p_enrollment_id: enrollmentId,
    p_legal_name: "Alex Driver",
    p_dob: "1990-05-17",
    p_license_no: "A1234567",
    p_license_state: "CA",
    p_phone: "+1 555 010 0199",
    p_county_id: countyId,
    p_citation_no: "ab-123",
    p_court_due_date: future(),
    p_security_question: "first_car",
    p_security_answer: "Civic",
    ...overrides,
  };
}

describe("driver details", () => {
  it("saves details for the own enrollment and reports them complete", async () => {
    const user = await signInAsStudent();
    const id = await enrollmentFor(user);
    const { error } = await user.client.rpc("save_driver_details", args(id));
    expect(error).toBeNull();
    const { data } = await user.client.rpc("has_driver_details", {
      p_enrollment_id: id,
    });
    expect(data).toBe(true);
    const { data: enr } = await serviceClient
      .from("enrollments")
      .select("citation_no")
      .eq("id", id)
      .single();
    expect(enr?.citation_no).toBe("AB-123");
  });

  it("stores the security answer only as a bcrypt hash", async () => {
    const user = await signInAsStudent();
    const id = await enrollmentFor(user);
    await user.client.rpc("save_driver_details", args(id));
    const { data } = await serviceClient
      .from("security_questions")
      .select("answer_hash")
      .eq("user_id", user.id)
      .single();
    expect(data?.answer_hash).toMatch(/^\$2[aby]\$/);
    expect(data?.answer_hash).not.toContain("Civic");
  });

  it("refuses another student's enrollment", async () => {
    const owner = await signInAsStudent();
    const other = await signInAsStudent();
    const id = await enrollmentFor(owner);
    const { error } = await other.client.rpc("save_driver_details", args(id));
    expect(error?.code).toBe("42501");
  });

  it("rejects placeholder dates of birth on a direct update", async () => {
    const user = await signInAsStudent();
    const { error } = await user.client
      .from("profiles")
      .update({ dob: "1900-01-01" })
      .eq("user_id", user.id);
    expect(error?.code).toBe("23514");
  });

  it("rejects a bad California license number", async () => {
    const user = await signInAsStudent();
    const id = await enrollmentFor(user);
    const { error } = await user.client.rpc(
      "save_driver_details",
      args(id, { p_license_no: "12345678" }),
    );
    expect(error?.code).toBe("23514");
  });

  it("locks legal name, dob and license after lock_driver_details but not phone", async () => {
    const user = await signInAsStudent();
    const id = await enrollmentFor(user);
    await user.client.rpc("save_driver_details", args(id));
    const { error: lockError } = await serviceClient.rpc(
      "lock_driver_details",
      { p_user_id: user.id },
    );
    expect(lockError).toBeNull();

    const viaRpc = await user.client.rpc(
      "save_driver_details",
      args(id, { p_legal_name: "Someone Else" }),
    );
    expect(viaRpc.error?.code).toBe("42501");
    const direct = await user.client
      .from("profiles")
      .update({ legal_name: "Someone Else" })
      .eq("user_id", user.id);
    expect(direct.error?.code).toBe("42501");

    const phone = await user.client
      .from("profiles")
      .update({ phone: "+1 555 010 0100" })
      .eq("user_id", user.id);
    expect(phone.error).toBeNull();

    const clientLock = await user.client.rpc("lock_driver_details", {
      p_user_id: user.id,
    });
    expect(clientLock.error).not.toBeNull();
  });

  it("lets an admin override the lock only with a reason, and audits it", async () => {
    const user = await signInAsStudent();
    const admin = await signInAsAdmin();
    const id = await enrollmentFor(user);
    await user.client.rpc("save_driver_details", args(id));
    await serviceClient.rpc("lock_driver_details", { p_user_id: user.id });

    const call = (reason: string) =>
      admin.client.rpc("admin_update_locked_details", {
        p_user_id: user.id,
        p_legal_name: "Corrected Name",
        p_dob: "1990-05-17",
        p_license_no: "A1234567",
        p_reason: reason,
      });
    expect((await call("")).error?.code).toBe("23514");
    expect((await call("Typo fixed per court letter")).error).toBeNull();

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("legal_name, id")
      .eq("user_id", user.id)
      .single();
    expect(profile?.legal_name).toBe("Corrected Name");
    const { data: audit } = await serviceClient
      .from("audit_log")
      .select("actor_id, after")
      .eq("action", "profile.details_override")
      .eq("entity_id", profile?.id ?? randomUUID());
    expect(audit).toHaveLength(1);
    expect(audit?.[0]?.actor_id).toBe(admin.id);

    const student = await user.client.rpc("admin_update_locked_details", {
      p_user_id: user.id,
      p_legal_name: "X Y",
      p_dob: "1990-05-17",
      p_license_no: "A1234567",
      p_reason: "student trying",
    });
    expect(student.error?.code).toBe("42501");
  });
});
