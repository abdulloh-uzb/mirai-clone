import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import type { Database, Enums } from "@/lib/database.types";
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

/** Buys the course for a Student the way the Stripe webhook does; returns the enrollment id. */
async function buy(userId: string): Promise<string> {
  const { data: order } = await serviceClient
    .from("orders")
    .insert({
      user_id: userId,
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
  const { data: enrollment } = await serviceClient
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .single();
  return enrollment!.id;
}

function laToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
  }).format(new Date());
}

describe("enrollment_stage", () => {
  it("applies the glossary rule", async () => {
    const admin = await signInAsAdmin();
    const future = new Date(Date.now() + 30 * 86_400_000).toISOString();
    const past = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const cases: Array<{
      args: Database["public"]["Functions"]["enrollment_stage"]["Args"];
      expected: Enums<"student_stage">;
    }> = [
      { args: {}, expected: "registered" },
      {
        args: { p_status: "refunded", p_expires_at: future },
        expected: "registered",
      },
      {
        args: { p_status: "active", p_expires_at: future },
        expected: "studying",
      },
      { args: { p_status: "active" }, expected: "studying" },
      {
        args: { p_status: "active", p_expires_at: past },
        expected: "needs_attention",
      },
      {
        args: { p_status: "paused", p_expires_at: future },
        expected: "needs_attention",
      },
      {
        args: { p_status: "locked", p_expires_at: future },
        expected: "needs_attention",
      },
      {
        args: { p_status: "expired", p_expires_at: past },
        expected: "needs_attention",
      },
      {
        args: { p_status: "completed", p_expires_at: past },
        expected: "completed",
      },
      {
        args: {
          p_status: "completed",
          p_expires_at: past,
          p_report_accepted: true,
        },
        expected: "reported",
      },
    ];
    for (const c of cases) {
      const { data, error } = await admin.client.rpc(
        "enrollment_stage",
        c.args,
      );
      expect(error).toBeNull();
      expect(data).toBe(c.expected);
    }
  });
});

describe("admin dashboard RPCs", () => {
  it("refuse a Student", async () => {
    const student = await signInAsStudent();
    const results = await Promise.all([
      student.client.rpc("admin_student_stages"),
      student.client.rpc("admin_stage_counts"),
      student.client.rpc("admin_daily_activity", { p_days: 30 }),
      student.client.rpc("admin_attention_items", { p_limit: 5 }),
    ]);
    for (const { error } of results) expect(error).not.toBeNull();
  });

  it("move a Student through the stages", async () => {
    const admin = await signInAsAdmin();
    const student = await createStudentAccount();
    const stageOf = async () =>
      (
        await admin.client.rpc("admin_search_students", {
          q: student.email,
          lim: 5,
          off: 0,
        })
      ).data?.[0]?.stage;

    expect(await stageOf()).toBe("registered");

    const enrollmentId = await buy(student.id);
    expect(await stageOf()).toBe("studying");

    await serviceClient
      .from("enrollments")
      .update({ status: "paused" })
      .eq("id", enrollmentId);
    expect(await stageOf()).toBe("needs_attention");

    await serviceClient
      .from("enrollments")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", enrollmentId);
    expect(await stageOf()).toBe("completed");

    const { data: certificate } = await serviceClient
      .from("certificates")
      .insert({ enrollment_id: enrollmentId, cert_no: `T-${randomUUID()}` })
      .select("id")
      .single();
    await serviceClient
      .from("completion_reports")
      .insert({ certificate_id: certificate!.id, status: "accepted" });
    expect(await stageOf()).toBe("reported");

    const reported = await admin.client.rpc("admin_search_students", {
      q: student.email,
      stage_filter: "reported",
      lim: 5,
      off: 0,
    });
    expect(reported.data?.map((r) => r.user_id)).toEqual([student.id]);
    const studying = await admin.client.rpc("admin_search_students", {
      q: student.email,
      stage_filter: "studying",
      lim: 5,
      off: 0,
    });
    expect(studying.data).toEqual([]);
  });

  it("admin_stage_counts returns five rows in stage order", async () => {
    const admin = await signInAsAdmin();
    const { data, error } = await admin.client.rpc("admin_stage_counts");
    expect(error).toBeNull();
    expect(data?.map((r) => r.stage)).toEqual([
      "registered",
      "studying",
      "needs_attention",
      "completed",
      "reported",
    ]);
    for (const row of data ?? [])
      expect(row.students).toBeGreaterThanOrEqual(0);
  });

  it("admin_daily_activity returns 30 consecutive days ending today (LA)", async () => {
    const admin = await signInAsAdmin();
    const student = await createStudentAccount();
    await buy(student.id);
    const { data, error } = await admin.client.rpc("admin_daily_activity", {
      p_days: 30,
    });
    expect(error).toBeNull();
    const rows = data ?? [];
    expect(rows).toHaveLength(30);
    for (let i = 1; i < rows.length; i++) {
      const gap =
        (Date.parse(rows[i]!.day) - Date.parse(rows[i - 1]!.day)) / 86_400_000;
      expect(gap).toBe(1);
    }
    const last = rows[rows.length - 1]!;
    expect(last.day).toBe(laToday());
    expect(last.enrollments).toBeGreaterThanOrEqual(1);
    expect(last.sales_cents).toBeGreaterThanOrEqual(2499);
  });

  it("admin_attention_items lists a paused enrollment and a court date due soon", async () => {
    const admin = await signInAsAdmin();
    const studentA = await createStudentAccount();
    const enrollmentA = await buy(studentA.id);
    await serviceClient
      .from("enrollments")
      .update({ status: "paused" })
      .eq("id", enrollmentA);

    const studentB = await createStudentAccount();
    const enrollmentB = await buy(studentB.id);
    const due = new Date(`${laToday()}T00:00:00Z`);
    due.setUTCDate(due.getUTCDate() + 3);
    await serviceClient
      .from("enrollments")
      .update({ court_due_date: due.toISOString().slice(0, 10) })
      .eq("id", enrollmentB);

    const { data, error } = await admin.client.rpc("admin_attention_items", {
      p_limit: 50,
    });
    expect(error).toBeNull();
    const rows = data ?? [];
    expect(rows).toContainEqual(
      expect.objectContaining({
        kind: "enrollment_blocked",
        ref_id: enrollmentA,
        detail: "paused",
      }),
    );
    expect(rows).toContainEqual(
      expect.objectContaining({ kind: "court_due_soon", ref_id: enrollmentB }),
    );
    for (const row of rows) {
      const ofKind = rows.filter((r) => r.kind === row.kind).length;
      expect(row.total).toBeGreaterThanOrEqual(ofKind);
    }
  });
});
