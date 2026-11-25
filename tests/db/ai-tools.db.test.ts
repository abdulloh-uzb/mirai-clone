import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { offlineAnswer } from "../../src/lib/ai/offline";
import { reindexKnowledgeBase } from "../../src/lib/ai/kb";
import { createAccountTools } from "../../src/lib/ai/tools";
import {
  deleteTestUsers,
  serviceClient,
  signInAsStudent,
  visitor,
} from "../support/users";

const tag = `ai-tools-${randomUUID()}`;

afterAll(async () => {
  await serviceClient.from("faq_items").delete().eq("slug", tag);
  await deleteTestUsers();
});

async function enroll(userId: string) {
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
  const { error: fulfillError } = await serviceClient.rpc("fulfill_checkout", {
    p_event_id: `evt_${randomUUID()}`,
    p_event_type: "checkout.session.completed",
    p_order_id: order.id,
    p_session_id: `cs_${randomUUID()}`,
    p_payment_intent: `pi_${randomUUID()}`,
  });
  if (fulfillError) throw fulfillError;
  const { data: enrollment } = await serviceClient
    .from("enrollments")
    .select("id")
    .eq("order_id", order.id)
    .single();
  return enrollment!.id;
}

async function addReport(enrollmentId: string, status: "queued" | "accepted") {
  const { data: cert, error } = await serviceClient
    .from("certificates")
    .insert({ enrollment_id: enrollmentId, cert_no: `C-${randomUUID()}` })
    .select("id")
    .single();
  if (error) throw error;
  const { error: reportError } = await serviceClient
    .from("completion_reports")
    .insert({ certificate_id: cert.id, status });
  if (reportError) throw reportError;
}

describe("account tools", () => {
  it("tell a student with no enrollment that they have not enrolled", async () => {
    const user = await signInAsStudent();
    const tools = createAccountTools(user.client);
    expect(await tools.getMyEnrollment()).toEqual({ enrolled: false });
    expect(await tools.getMyReportStatus()).toEqual({ enrolled: false });
    expect(await tools.getMyRefundEligibility()).toEqual({ enrolled: false });
    expect(await tools.getMyCourtDeadline()).toEqual({ enrolled: false });
    const answer = await offlineAnswer({
      text: "Did the DMV get my completion?",
      locale: "en",
      tools,
      search: async () => [],
    });
    expect(answer.text).toContain("not enrolled");
  });

  it("report the real status, and never another student's data", async () => {
    const user = await signInAsStudent();
    const other = await signInAsStudent();
    const enrollmentId = await enroll(user.id);

    const before = await createAccountTools(user.client).getMyReportStatus();
    expect(before).toEqual({ enrolled: true, certificateIssued: false });

    await addReport(enrollmentId, "accepted");
    const status = await createAccountTools(user.client).getMyReportStatus();
    expect(status).toMatchObject({
      enrolled: true,
      certificateIssued: true,
      reportStatus: "accepted",
    });
    const answer = await offlineAnswer({
      text: "Did the DMV get my completion?",
      locale: "en",
      tools: createAccountTools(user.client),
      search: async () => [],
    });
    expect(answer.text).toContain("confirmed your completion");

    // The other student sees nothing of it.
    expect(await createAccountTools(other.client).getMyReportStatus()).toEqual({
      enrolled: false,
    });
    const refund = await createAccountTools(
      user.client,
    ).getMyRefundEligibility();
    expect(refund).toMatchObject({ enrolled: true, eligible: false });
  });
});

describe("knowledge base", () => {
  it("search_kb returns chunks after a reindex and is service-only", async () => {
    const { error } = await serviceClient.from("faq_items").insert({
      locale: "en",
      slug: tag,
      title: "Zebrafish certificate delivery",
      body: "Your zebrafish certificate is emailed within one business day.",
      category: "certificates",
      published: true,
    });
    expect(error).toBeNull();
    const count = await reindexKnowledgeBase(serviceClient);
    expect(count).toBeGreaterThan(0);

    const { data, error: searchError } = await serviceClient.rpc("search_kb", {
      p_query: "when is my zebrafish certificate emailed?",
      p_locale: "en",
      p_limit: 3,
    });
    expect(searchError).toBeNull();
    expect(data?.[0]?.content).toContain("zebrafish");
    expect(data?.[0]?.url).toBe(`/faq#${tag}`);

    const user = await signInAsStudent();
    const denied = await user.client.rpc("search_kb", {
      p_query: "zebrafish",
      p_locale: "en",
      p_limit: 3,
    });
    expect(denied.error).not.toBeNull();
    const anon = await visitor().rpc("search_kb", {
      p_query: "zebrafish",
      p_locale: "en",
      p_limit: 3,
    });
    expect(anon.error).not.toBeNull();
  });
});

describe("has_active_exam", () => {
  it("is false without an exam attempt and not callable by visitors", async () => {
    const user = await signInAsStudent();
    const { data } = await user.client.rpc("has_active_exam");
    expect(data).toBe(false);
    const anon = await visitor().rpc("has_active_exam");
    expect(anon.error).not.toBeNull();
  });

  it("is true while an attempt is unsubmitted, false after submit", async () => {
    const user = await signInAsStudent();
    const enrollmentId = await enroll(user.id);
    const { data: attempt, error } = await serviceClient
      .from("exam_attempts")
      .insert({ enrollment_id: enrollmentId })
      .select("id")
      .single();
    expect(error).toBeNull();
    expect((await user.client.rpc("has_active_exam")).data).toBe(true);
    await serviceClient
      .from("exam_attempts")
      .update({ submitted_at: new Date().toISOString() })
      .eq("id", attempt!.id);
    expect((await user.client.rpc("has_active_exam")).data).toBe(false);
  });
});
