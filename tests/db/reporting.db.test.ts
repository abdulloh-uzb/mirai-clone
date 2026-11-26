import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runBatch } from "../../src/lib/reporting/run-batch-core";
import { MockCaliforniaAdapter } from "../../src/lib/reporting/adapters/mock-california";
import type { StateReportingAdapter } from "../../src/lib/reporting/types";
import { enrolledStudent, loadCourse } from "../support/course";
import { deleteTestUsers, serviceClient } from "../support/users";

let courseId: string;
let countyId: string;

beforeAll(async () => {
  ({ courseId, countyId } = await loadCourse());
});
afterAll(deleteTestUsers);

async function queuedReport() {
  const s = await enrolledStudent(courseId, countyId);
  await serviceClient.from("exam_attempts").insert({
    enrollment_id: s.enrollmentId,
    passed: true,
    score: 1,
    submitted_at: new Date().toISOString(),
  });
  await serviceClient
    .from("enrollments")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", s.enrollmentId);
  const cert = (
    await serviceClient.rpc("issue_certificate", {
      p_enrollment_id: s.enrollmentId,
    })
  ).data!;
  const { data: report } = await serviceClient
    .from("completion_reports")
    .select("id")
    .eq("certificate_id", cert.id)
    .single();
  return { student: s, reportId: report!.id };
}

const accepting = new MockCaliforniaAdapter({
  delay: async () => {},
  alwaysAccept: true,
});
const batch = (adapter: StateReportingAdapter, now = new Date()) =>
  runBatch(
    { service: serviceClient, adapterFor: () => adapter },
    { trigger: "manual", now },
  );
const report = async (id: string) =>
  (
    await serviceClient
      .from("completion_reports")
      .select("*")
      .eq("id", id)
      .single()
  ).data!;

describe("completion reporting batches", () => {
  it("goes queued -> sent -> accepted over two batches and logs every call", async () => {
    const { reportId } = await queuedReport();

    await batch(accepting);
    const sent = await report(reportId);
    expect(sent.status).toBe("sent");
    expect(sent.sent_at).not.toBeNull();
    expect(sent.regulator_ref).toMatch(/^CA-MOCK-/);
    expect(sent.batch_id).not.toBeNull();
    expect(sent.attempts).toBe(1);

    await batch(accepting);
    const accepted = await report(reportId);
    expect(accepted.status).toBe("accepted");
    expect(accepted.accepted_at).not.toBeNull();
    expect(accepted.court_notified_at).toBe(accepted.accepted_at);

    const { data: attempts } = await serviceClient
      .from("report_attempts")
      .select("request, response")
      .eq("report_id", reportId);
    expect(attempts).toHaveLength(2);
    const { data: batches } = await serviceClient
      .from("report_batches")
      .select("finished_at, trigger")
      .eq("id", sent.batch_id!)
      .single();
    expect(batches?.finished_at).not.toBeNull();
  });

  it("retries an error with backoff and stops after 5 attempts", async () => {
    const { reportId } = await queuedReport();
    let calls = 0;
    const failing: StateReportingAdapter = {
      async submitCompletions(items) {
        calls += items.filter((i) => i.reportId === reportId).length;
        return items.map((i) => ({
          reportId: i.reportId,
          status: "error" as const,
          reason: "down",
        }));
      },
      async checkStatus() {
        return [];
      },
    };
    let now = new Date();
    await batch(failing, now);
    let r = await report(reportId);
    expect(r.status).toBe("error");
    expect(r.attempts).toBe(1);
    expect(new Date(r.next_attempt_at!).getTime() - now.getTime()).toBe(
      5 * 60_000,
    );

    // Not due yet: nothing is submitted.
    await batch(failing, new Date(now.getTime() + 60_000));
    expect((await report(reportId)).attempts).toBe(1);

    for (let i = 2; i <= 6; i++) {
      now = new Date(now.getTime() + 13 * 3_600_000);
      await batch(failing, now);
    }
    r = await report(reportId);
    expect(r.attempts).toBe(5);
    expect(calls).toBe(5);
  });

  it("lets a student read status and timestamps, not regulator_ref or error", async () => {
    const { student, reportId } = await queuedReport();
    await batch(accepting);
    const own = await student.user.client
      .from("completion_reports")
      .select("status, sent_at, accepted_at")
      .eq("id", reportId)
      .single();
    expect(own.data?.status).toBe("sent");
    expect(own.data?.sent_at).not.toBeNull();
    const hidden = await student.user.client
      .from("completion_reports")
      .select("regulator_ref")
      .eq("id", reportId);
    expect(hidden.error).not.toBeNull();
    const hiddenError = await student.user.client
      .from("completion_reports")
      .select("error")
      .eq("id", reportId);
    expect(hiddenError.error).not.toBeNull();
  });
});
