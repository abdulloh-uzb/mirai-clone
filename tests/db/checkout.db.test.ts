import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsStudent,
} from "../support/users";

afterAll(deleteTestUsers);

async function pendingOrder(userId: string, locale = "ja") {
  const { data, error } = await serviceClient
    .from("orders")
    .insert({
      user_id: userId,
      product: "online_course",
      amount_cents: 2499,
      course_locale: locale,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

const fulfill = (orderId: string, eventId = `evt_${randomUUID()}`) =>
  serviceClient.rpc("fulfill_checkout", {
    p_event_id: eventId,
    p_event_type: "checkout.session.completed",
    p_order_id: orderId,
    p_session_id: `cs_${randomUUID()}`,
    p_payment_intent: "pi_test",
  });

async function enrollmentsOf(orderId: string) {
  const { data, error } = await serviceClient
    .from("enrollments")
    .select("course_locale, expires_at, status")
    .eq("order_id", orderId);
  if (error) throw error;
  return data;
}

describe("fulfill_checkout", () => {
  it("pays the order and creates one enrollment in the order's language", async () => {
    const user = await signInAsStudent();
    const orderId = await pendingOrder(user.id);
    const { data, error } = await fulfill(orderId);
    expect(error).toBeNull();
    expect(data).toBe(true);
    const { data: order } = await serviceClient
      .from("orders")
      .select("status, stripe_payment_intent")
      .eq("id", orderId)
      .single();
    expect(order?.status).toBe("paid");
    expect(order?.stripe_payment_intent).toBe("pi_test");
    const rows = await enrollmentsOf(orderId);
    expect(rows).toHaveLength(1);
    expect(rows[0].course_locale).toBe("ja");
    expect(rows[0].status).toBe("active");
    const days =
      (new Date(rows[0].expires_at ?? 0).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(89);
    expect(days).toBeLessThan(91);
  });

  it("creates nothing when the same event id is replayed", async () => {
    const user = await signInAsStudent();
    const orderId = await pendingOrder(user.id);
    const eventId = `evt_${randomUUID()}`;
    expect((await fulfill(orderId, eventId)).data).toBe(true);
    expect((await fulfill(orderId, eventId)).data).toBe(false);
    expect(await enrollmentsOf(orderId)).toHaveLength(1);
  });

  it("creates no second enrollment for a different event on the same order", async () => {
    const user = await signInAsStudent();
    const orderId = await pendingOrder(user.id);
    await fulfill(orderId);
    await fulfill(orderId);
    expect(await enrollmentsOf(orderId)).toHaveLength(1);
  });

  it("cannot be executed by a student", async () => {
    const user = await signInAsStudent();
    const orderId = await pendingOrder(user.id);
    const { error } = await user.client.rpc("fulfill_checkout", {
      p_event_id: `evt_${randomUUID()}`,
      p_event_type: "checkout.session.completed",
      p_order_id: orderId,
      p_session_id: "cs_x",
      p_payment_intent: "pi_x",
    });
    expect(error).not.toBeNull();
    expect(await enrollmentsOf(orderId)).toHaveLength(0);
  });

  it("does not let a student insert orders or enrollments", async () => {
    const user = await signInAsStudent();
    const { error: orderError } = await user.client
      .from("orders")
      .insert({ user_id: user.id, product: "online_course", amount_cents: 0 });
    expect(orderError).not.toBeNull();
    const { data: course } = await serviceClient
      .from("courses")
      .select("id")
      .limit(1)
      .single();
    const { error: enrollError } = await user.client
      .from("enrollments")
      .insert({
        user_id: user.id,
        course_id: course?.id ?? "",
        course_locale: "en",
      });
    expect(enrollError).not.toBeNull();
  });
});
