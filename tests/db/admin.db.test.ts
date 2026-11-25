import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import {
  createStudentAccount,
  deleteTestUsers,
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
} from "../support/users";

afterAll(async () => {
  await deleteTestUsers();
});

describe("admin_dashboard_stats", () => {
  it("refuses a Student", async () => {
    const student = await signInAsStudent();
    const { error } = await student.client.rpc("admin_dashboard_stats");
    expect(error).not.toBeNull();
  });

  it("returns the numbers to an Admin", async () => {
    const admin = await signInAsAdmin();
    const { data, error } = await admin.client.rpc("admin_dashboard_stats");
    expect(error).toBeNull();
    expect(data).toMatchObject({
      sales_cents: { today: expect.any(Number) },
      enrollments: { d30: expect.any(Number) },
      refunds_30d: { count: expect.any(Number) },
    });
  });
});

describe("admin_search_students", () => {
  it("refuses a Student", async () => {
    const student = await signInAsStudent();
    const { error } = await student.client.rpc("admin_search_students", {
      q: "",
      lim: 5,
      off: 0,
    });
    expect(error).not.toBeNull();
  });

  it("finds a Student by email, license number and citation number", async () => {
    const admin = await signInAsAdmin();
    const student = await createStudentAccount({
      firstName: "Searchable",
      lastName: "Person",
    });
    const license = `Z${Math.floor(1000000 + Math.random() * 8999999)}`;
    const citation = `CIT-${randomUUID().slice(0, 8)}`;
    await serviceClient
      .from("profiles")
      .update({ license_no: license, license_state: "CA" })
      .eq("user_id", student.id);
    const { data: order } = await serviceClient
      .from("orders")
      .insert({
        user_id: student.id,
        product: "online_course",
        amount_cents: 2499,
        course_locale: "en",
      })
      .select("id")
      .single();
    await serviceClient.rpc("fulfill_checkout", {
      p_event_id: `evt_${randomUUID()}`,
      p_event_type: "checkout.session.completed",
      p_order_id: order!.id,
      p_session_id: `cs_${randomUUID()}`,
      p_payment_intent: `pi_${randomUUID()}`,
    });
    await serviceClient
      .from("enrollments")
      .update({ citation_no: citation })
      .eq("user_id", student.id);

    for (const q of [student.email, license, citation]) {
      const { data, error } = await admin.client.rpc("admin_search_students", {
        q,
        lim: 10,
        off: 0,
      });
      expect(error).toBeNull();
      expect(data?.map((r) => r.user_id)).toEqual([student.id]);
    }
  });
});

describe("audit of admin writes", () => {
  it("admin_update_locked_details writes an audit_log row", async () => {
    const admin = await signInAsAdmin();
    const student = await createStudentAccount();
    const { error } = await admin.client.rpc("admin_update_locked_details", {
      p_user_id: student.id,
      p_legal_name: "Audited Name",
      p_dob: "1990-01-01",
      p_license_no: "A1234567",
      p_reason: "typo fix for audit test",
    });
    expect(error).toBeNull();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("user_id", student.id)
      .single();
    const { data: rows } = await serviceClient
      .from("audit_log")
      .select("actor_id, action")
      .eq("entity_id", profile!.id);
    expect(rows).toEqual([
      { actor_id: admin.id, action: "profile.details_override" },
    ]);
  });
});
