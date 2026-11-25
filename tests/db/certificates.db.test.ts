import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { enrolledStudent, loadCourse } from "../support/course";
import { deleteTestUsers, serviceClient, visitor } from "../support/users";

let courseId: string;
let countyId: string;

beforeAll(async () => {
  ({ courseId, countyId } = await loadCourse());
});
afterAll(deleteTestUsers);

async function completed() {
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
  return s;
}

const issue = (id: string) =>
  serviceClient.rpc("issue_certificate", { p_enrollment_id: id });

describe("certificates", () => {
  it("issues once per enrollment and queues one report", async () => {
    const s = await completed();
    const a = await issue(s.enrollmentId);
    const b = await issue(s.enrollmentId);
    expect(a.error).toBeNull();
    expect(a.data?.cert_no).toMatch(/^RR-\d{4}-[0-9A-F]{8}$/);
    expect(b.data?.id).toBe(a.data?.id);
    const { data: reports } = await serviceClient
      .from("completion_reports")
      .select("id, status")
      .eq("certificate_id", a.data!.id);
    expect(reports).toHaveLength(1);
    expect(reports?.[0].status).toBe("queued");
  });

  it("refuses an enrollment that is not completed", async () => {
    const s = await enrolledStudent(courseId, countyId);
    const r = await issue(s.enrollmentId);
    expect(r.error?.message).toContain("not_completed");
  });

  it("verifies with only validity and the date", async () => {
    const s = await completed();
    const c = (await issue(s.enrollmentId)).data!;
    const ok = await visitor().rpc("verify_certificate", {
      p_cert_no: c.cert_no.toLowerCase(),
    });
    expect(Object.keys(ok.data as object).sort()).toEqual([
      "completedAt",
      "valid",
    ]);
    expect(ok.data).toMatchObject({ valid: true });
    expect((ok.data as { completedAt: string }).completedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );

    await serviceClient
      .from("certificates")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", c.id);
    const revoked = await visitor().rpc("verify_certificate", {
      p_cert_no: c.cert_no,
    });
    expect(revoked.data).toEqual({ valid: false, completedAt: null });

    const none = await visitor().rpc("verify_certificate", {
      p_cert_no: "RR-0000-NOPE",
    });
    expect(none.data).toEqual({ valid: false, completedAt: null });
  });

  it("hides a certificate from other students and keeps issuing server-only", async () => {
    const a = await completed();
    const b = await completed();
    const cert = (await issue(a.enrollmentId)).data!;
    const { data } = await b.user.client
      .from("certificates")
      .select("id")
      .eq("id", cert.id);
    expect(data).toEqual([]);
    const own = await a.user.client
      .from("certificates")
      .select("id")
      .eq("id", cert.id);
    expect(own.data).toHaveLength(1);
    const denied = await a.user.client.rpc("issue_certificate", {
      p_enrollment_id: a.enrollmentId,
    });
    expect(denied.error).not.toBeNull();
    const anon = await visitor().rpc("issue_certificate", {
      p_enrollment_id: a.enrollmentId,
    });
    expect(anon.error).not.toBeNull();
  });
});
