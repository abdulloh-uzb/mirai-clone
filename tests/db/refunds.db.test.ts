import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
} from "../support/users";

const tag = `refunds-test-${randomUUID()}`;

afterAll(async () => {
  await serviceClient.from("lessons").delete().eq("title->>en", tag);
  await deleteTestUsers();
});

async function paidOrder(userId: string) {
  const { data: order, error } = await serviceClient
    .from("orders")
    .insert({
      user_id: userId,
      product: "online_course",
      amount_cents: 2499,
      course_locale: "en",
    })
    .select("id")
    .single();
  if (error) throw error;
  const pi = `pi_${randomUUID()}`;
  const { error: fulfillError } = await serviceClient.rpc("fulfill_checkout", {
    p_event_id: `evt_${randomUUID()}`,
    p_event_type: "checkout.session.completed",
    p_order_id: order.id,
    p_session_id: `cs_${randomUUID()}`,
    p_payment_intent: pi,
  });
  if (fulfillError) throw fulfillError;
  const { data: enrollment } = await serviceClient
    .from("enrollments")
    .select("id, course_id")
    .eq("order_id", order.id)
    .single();
  return { orderId: order.id, pi, enrollment: enrollment! };
}

async function startLesson(enrollment: { id: string; course_id: string }) {
  const { data: section } = await serviceClient
    .from("sections")
    .select("id")
    .eq("course_id", enrollment.course_id)
    .limit(1)
    .single();
  const { data: lesson, error } = await serviceClient
    .from("lessons")
    .insert({
      section_id: section!.id,
      position: 2000 + Math.floor(Math.random() * 100000),
      title: { en: tag },
    })
    .select("id")
    .single();
  if (error) throw error;
  await serviceClient.from("lesson_blocks").insert({
    lesson_id: lesson.id,
    position: 1,
    type: "rich_text",
    content: { en: tag },
  });
  const { error: progressError } = await serviceClient
    .from("lesson_progress")
    .insert({
      enrollment_id: enrollment.id,
      lesson_id: lesson.id,
      seconds_spent: 30,
    });
  if (progressError) throw progressError;
  return lesson.id;
}

describe("request_refund", () => {
  it("records a 100% request inside the window with no progress", async () => {
    const user = await signInAsStudent();
    const { orderId } = await paidOrder(user.id);
    const { data, error } = await user.client.rpc("request_refund", {
      p_order_id: orderId,
      p_reason: "changed my mind",
      p_pct: 100,
      p_amount_cents: 2499,
    });
    expect(error).toBeNull();
    const { data: row } = await serviceClient
      .from("refunds")
      .select("status, pct, amount_cents")
      .eq("id", data!)
      .single();
    expect(row).toEqual({ status: "requested", pct: 100, amount_cents: 2499 });
  });

  it("rejects a 100% claim after lessons started, accepts 50%", async () => {
    const user = await signInAsStudent();
    const { orderId, enrollment } = await paidOrder(user.id);
    await startLesson(enrollment);
    const late = await user.client.rpc("request_refund", {
      p_order_id: orderId,
      p_reason: "",
      p_pct: 100,
      p_amount_cents: 2499,
    });
    expect(late.error).not.toBeNull();
    const half = await user.client.rpc("request_refund", {
      p_order_id: orderId,
      p_reason: "",
      p_pct: 50,
      p_amount_cents: 1250,
    });
    expect(half.error).toBeNull();
  });

  it("rejects a second open request and someone else's order", async () => {
    const user = await signInAsStudent();
    const other = await signInAsStudent();
    const { orderId } = await paidOrder(user.id);
    const args = {
      p_order_id: orderId,
      p_reason: "",
      p_pct: 100,
      p_amount_cents: 2499,
    };
    expect((await user.client.rpc("request_refund", args)).error).toBeNull();
    expect(
      (await user.client.rpc("request_refund", args)).error,
    ).not.toBeNull();
    expect(
      (await other.client.rpc("request_refund", args)).error,
    ).not.toBeNull();
  });

  it("rejects a request outside the 7-day window", async () => {
    const user = await signInAsStudent();
    const { orderId } = await paidOrder(user.id);
    await serviceClient
      .from("orders")
      .update({ paid_at: new Date(Date.now() - 8 * 86400000).toISOString() })
      .eq("id", orderId);
    const { error } = await user.client.rpc("request_refund", {
      p_order_id: orderId,
      p_reason: "",
      p_pct: 100,
      p_amount_cents: 2499,
    });
    expect(error).not.toBeNull();
  });
});

describe("mark_refund and apply_refund_event", () => {
  it("is service-role only", async () => {
    const admin = await signInAsAdmin();
    const { error } = await admin.client.rpc("mark_refund", {
      p_refund_id: randomUUID(),
      p_status: "approved",
      p_actor: admin.id,
    });
    expect(error).not.toBeNull();
  });

  it("approve, then the refund event revokes the enrollment; replay is a no-op", async () => {
    const user = await signInAsStudent();
    const admin = await signInAsAdmin();
    const { orderId, pi, enrollment } = await paidOrder(user.id);
    const lessonId = await startLesson(enrollment);
    // Remove the progress so a 100% request is allowed.
    await serviceClient
      .from("lesson_progress")
      .delete()
      .eq("enrollment_id", enrollment.id);
    const { data: refundId } = await user.client.rpc("request_refund", {
      p_order_id: orderId,
      p_reason: "",
      p_pct: 100,
      p_amount_cents: 2499,
    });
    const read = () =>
      user.client.from("lesson_blocks").select("id").eq("lesson_id", lessonId);
    expect((await read()).data).toHaveLength(1);

    const mark = await serviceClient.rpc("mark_refund", {
      p_refund_id: refundId!,
      p_status: "approved",
      p_actor: admin.id,
    });
    expect(mark.error).toBeNull();

    const eventId = `evt_${randomUUID()}`;
    const first = await serviceClient.rpc("apply_refund_event", {
      p_event_id: eventId,
      p_payment_intent: pi,
      p_amount_refunded: 2499,
    });
    expect(first.data).toBe(true);
    const replay = await serviceClient.rpc("apply_refund_event", {
      p_event_id: eventId,
      p_payment_intent: pi,
      p_amount_refunded: 2499,
    });
    expect(replay.data).toBe(false);

    const { data: order } = await serviceClient
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();
    const { data: enr } = await serviceClient
      .from("enrollments")
      .select("status")
      .eq("id", enrollment.id)
      .single();
    const { data: refund } = await serviceClient
      .from("refunds")
      .select("status, approved_by")
      .eq("id", refundId!)
      .single();
    expect(order?.status).toBe("refunded");
    expect(enr?.status).toBe("refunded");
    expect(refund).toEqual({ status: "processed", approved_by: admin.id });
    expect((await read()).data ?? []).toEqual([]);

    const { data: audit } = await serviceClient
      .from("audit_log")
      .select("action")
      .eq("entity_id", refundId!);
    expect(audit?.map((a) => a.action).sort()).toEqual([
      "refund.approved",
      "refund.processed",
    ]);
  });

  it("marks a partial refund", async () => {
    const user = await signInAsStudent();
    const { orderId, pi } = await paidOrder(user.id);
    await serviceClient.rpc("apply_refund_event", {
      p_event_id: `evt_${randomUUID()}`,
      p_payment_intent: pi,
      p_amount_refunded: 1250,
    });
    const { data } = await serviceClient
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();
    expect(data?.status).toBe("partially_refunded");
  });
});
