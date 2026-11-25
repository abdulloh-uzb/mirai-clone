import { beforeAll, afterAll, describe, expect, it } from "vitest";
import {
  deleteTestUsers,
  serviceClient,
  signInAsStudent,
  type TestUser,
} from "../support/users";

afterAll(deleteTestUsers);

let countyId: string;
let courseId: string;
let lessons: { id: string; section: number; position: number }[] = [];

beforeAll(async () => {
  const { data: county } = await serviceClient
    .from("counties")
    .select("id")
    .limit(1)
    .single();
  countyId = county!.id;
  const { data: course } = await serviceClient
    .from("courses")
    .select("id")
    .limit(1)
    .single();
  courseId = course!.id;
  const { data } = await serviceClient
    .from("lessons")
    .select("id, position, sections!inner(position, course_id)")
    .eq("sections.course_id", courseId);
  lessons = (data ?? [])
    .map((l) => ({
      id: l.id,
      position: l.position,
      section: l.sections.position,
    }))
    .sort((a, b) => a.section - b.section || a.position - b.position);
});

const lesson = (section: number, position: number) =>
  lessons.find((l) => l.section === section && l.position === position)!;

async function setup(
  opts: { details?: boolean; expiresAt?: string } = {},
): Promise<{ user: TestUser; enrollmentId: string }> {
  const user = await signInAsStudent();
  const { data, error } = await serviceClient
    .from("enrollments")
    .insert({
      user_id: user.id,
      course_id: courseId,
      course_locale: "en",
      expires_at:
        opts.expiresAt ?? new Date(Date.now() + 86400000).toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
  if (opts.details !== false) {
    const due = new Date();
    due.setFullYear(due.getFullYear() + 1);
    const { error: rpcError } = await user.client.rpc("save_driver_details", {
      p_enrollment_id: data.id,
      p_legal_name: "Alex Driver",
      p_dob: "1990-05-17",
      p_license_no: "A1234567",
      p_license_state: "CA",
      p_phone: "+1 555 010 0199",
      p_county_id: countyId,
      p_citation_no: "ab-123",
      p_court_due_date: due.toISOString().slice(0, 10),
      p_security_question: "first_car",
      p_security_answer: "Civic",
    });
    if (rpcError) throw rpcError;
  }
  return { user, enrollmentId: data.id };
}

const record = (u: TestUser, e: string, l: string, s = 30) =>
  u.client.rpc("record_lesson_time", {
    p_enrollment_id: e,
    p_lesson_id: l,
    p_seconds: s,
    p_block_position: 1,
  });

describe("course progress", () => {
  it("rejects time without driver details", async () => {
    const { user, enrollmentId } = await setup({ details: false });
    const { error } = await record(user, enrollmentId, lesson(1, 1).id);
    expect(error?.message).toContain("details_required");
  });

  it("rejects locked lessons and sections", async () => {
    const { user, enrollmentId } = await setup();
    const second = await record(user, enrollmentId, lesson(1, 2).id);
    expect(second.error?.message).toContain("lesson_locked");
    const sec2 = await record(user, enrollmentId, lesson(2, 1).id);
    expect(sec2.error?.message).toContain("lesson_locked");
    const { data } = await user.client.rpc("section_unlocked", {
      p_enrollment_id: enrollmentId,
      p_section_position: 2,
    });
    expect(data).toBe(false);
  });

  it("caps credit per call and by elapsed time", async () => {
    const { user, enrollmentId } = await setup();
    const id = lesson(1, 1).id;
    const first = await record(user, enrollmentId, id, 500);
    expect(first.error).toBeNull();
    expect(first.data).toBe(30);
    const second = await record(user, enrollmentId, id, 30);
    expect(second.data).toBeLessThan(60);
    const { data: enr } = await serviceClient
      .from("enrollments")
      .select("started_at")
      .eq("id", enrollmentId)
      .single();
    expect(enr?.started_at).not.toBeNull();
  });

  it("completes a lesson only after the minimum time, then unlocks the next", async () => {
    const { user, enrollmentId } = await setup();
    const id = lesson(1, 1).id;
    await record(user, enrollmentId, id, 5);
    const early = await user.client.rpc("complete_lesson", {
      p_enrollment_id: enrollmentId,
      p_lesson_id: id,
    });
    expect(early.error?.message).toContain("min_time_not_met");

    await serviceClient
      .from("lesson_progress")
      .update({ seconds_spent: 60 })
      .eq("enrollment_id", enrollmentId)
      .eq("lesson_id", id);
    const ok = await user.client.rpc("complete_lesson", {
      p_enrollment_id: enrollmentId,
      p_lesson_id: id,
    });
    expect(ok.error).toBeNull();
    const next = await record(user, enrollmentId, lesson(1, 2).id, 5);
    expect(next.error).toBeNull();
  });

  it("rejects an expired enrollment and marks it expired", async () => {
    const { user, enrollmentId } = await setup({
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    const { error } = await record(user, enrollmentId, lesson(1, 1).id);
    expect(error?.message).toContain("enrollment_expired");
    const { data: flipped } = await user.client.rpc(
      "expire_enrollment_if_due",
      { p_enrollment_id: enrollmentId },
    );
    expect(flipped).toBe(true);
    const { data } = await serviceClient
      .from("enrollments")
      .select("status")
      .eq("id", enrollmentId)
      .single();
    expect(data?.status).toBe("expired");
    const again = await record(user, enrollmentId, lesson(1, 1).id);
    expect(again.error?.message).toContain("enrollment_expired");
  });

  it("does not let another student record time", async () => {
    const { enrollmentId } = await setup();
    const other = await signInAsStudent();
    const { error } = await record(other, enrollmentId, lesson(1, 1).id);
    expect(error).not.toBeNull();
    const { data } = await serviceClient
      .from("lesson_progress")
      .select("id")
      .eq("enrollment_id", enrollmentId);
    expect(data).toHaveLength(0);
  });
});
