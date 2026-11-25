import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  completeLessons,
  enrolledStudent,
  loadCourse,
  type LessonRef,
} from "../support/course";
import { deleteTestUsers, serviceClient } from "../support/users";

let courseId: string;
let countyId: string;
let lessons: LessonRef[];

beforeAll(async () => {
  ({ courseId, countyId, lessons } = await loadCourse());
});
afterAll(deleteTestUsers);

type S = Awaited<ReturnType<typeof atMilestone>>;

async function atMilestone() {
  const s = await enrolledStudent(courseId, countyId);
  await completeLessons(s.enrollmentId, lessons.slice(0, 3));
  return s;
}

const due = (s: S) =>
  s.user.client.rpc("identity_check_due", { p_enrollment_id: s.enrollmentId });
const answer = (s: S, key: string, value: string) =>
  s.user.client.rpc("answer_identity_check", {
    p_enrollment_id: s.enrollmentId,
    p_question_key: key,
    p_answer: value,
  });

describe("identity checks", () => {
  it("is not due before three lessons, due after, and blocks progress", async () => {
    const s = await enrolledStudent(courseId, countyId);
    await completeLessons(s.enrollmentId, lessons.slice(0, 2));
    expect((await due(s)).data).toBeNull();
    await completeLessons(s.enrollmentId, lessons.slice(2, 3));
    expect((await due(s)).data).toMatchObject({ questionKey: "dob" });
    const blocked = await s.user.client.rpc("record_lesson_time", {
      p_enrollment_id: s.enrollmentId,
      p_lesson_id: lessons[3].id,
      p_seconds: 5,
      p_block_position: 1,
    });
    expect(blocked.error?.message).toContain("identity_check_required");
  });

  it("clears the check on a correct dob and logs it", async () => {
    const s = await atMilestone();
    const res = await answer(s, "dob", "1990-05-17");
    expect(res.data).toEqual({ correct: true, paused: false });
    expect((await due(s)).data).toBeNull();
    const { data } = await serviceClient
      .from("identity_checks")
      .select("question_key, correct")
      .eq("enrollment_id", s.enrollmentId);
    expect(data).toEqual([{ question_key: "dob", correct: true }]);
  });

  it("asks again after a wrong answer and pauses after two wrong in a row", async () => {
    const s = await atMilestone();
    const first = await answer(s, "dob", "2000-01-01");
    expect(first.data).toEqual({ correct: false, paused: false });
    expect((await due(s)).data).toMatchObject({
      questionKey: "license_no_last4",
    });
    const second = await answer(s, "license_no_last4", "0000");
    expect(second.data).toEqual({ correct: false, paused: true });
    const { data } = await serviceClient
      .from("enrollments")
      .select("status")
      .eq("id", s.enrollmentId)
      .single();
    expect(data?.status).toBe("paused");
    const blocked = await s.user.client.rpc("record_lesson_time", {
      p_enrollment_id: s.enrollmentId,
      p_lesson_id: lessons[3].id,
      p_seconds: 5,
      p_block_position: 1,
    });
    expect(blocked.error?.message).toContain("enrollment_not_active");
  });

  it("compares license last 4 and the security answer through the hash", async () => {
    const t = await atMilestone();
    await answer(t, "dob", "2000-01-01"); // wrong
    const lic = await answer(t, "license_no_last4", "4567"); // right, resets the run
    expect(lic.data).toEqual({ correct: true, paused: false });
    expect((await due(t)).data).toBeNull();

    // The next milestone (9 completed lessons) asks the security question.
    await completeLessons(t.enrollmentId, lessons.slice(3, 9));
    expect((await due(t)).data).toMatchObject({
      questionKey: "security_question",
      prompt: "first_car",
    });
    const bad = await answer(t, "security_question", "Corolla");
    expect(bad.data).toEqual({ correct: false, paused: false });
    expect(((await due(t)).data as { questionKey: string }).questionKey).toBe(
      "dob",
    );
    const ok = await answer(t, "dob", "1990-05-17");
    expect(ok.data).toEqual({ correct: true, paused: false });
    expect(
      (await answer(t, "security_question", "civic")).error?.message,
    ).toContain("no_identity_check_due");
  });
});
