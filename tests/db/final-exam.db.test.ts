import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  completeLessons,
  enrolledStudent,
  loadCourse,
  type LessonRef,
} from "../support/course";
import {
  deleteTestUsers,
  serviceClient,
  signInAsStudent,
} from "../support/users";

let courseId: string;
let countyId: string;
let lessons: LessonRef[];
let sections: { id: string; position: number }[];

beforeAll(async () => {
  ({ courseId, countyId, lessons, sections } = await loadCourse());
});
afterAll(deleteTestUsers);

type Payload = {
  attemptId: string;
  attemptNo: number;
  expiresAt: string;
  questions: { id: string; text: string; options: { id: string }[] }[];
};

// A student who finished every lesson, passed every quiz and spent enough time.
async function ready() {
  const s = await enrolledStudent(courseId, countyId);
  await completeLessons(s.enrollmentId, lessons);
  await serviceClient
    .from("lesson_progress")
    .update({ seconds_spent: 5000 })
    .eq("enrollment_id", s.enrollmentId);
  await serviceClient.from("quiz_attempts").insert(
    sections.map((sec) => ({
      enrollment_id: s.enrollmentId,
      section_id: sec.id,
      passed: true,
      score: 1,
      submitted_at: new Date().toISOString(),
    })),
  );
  return s;
}

type S = Awaited<ReturnType<typeof ready>>;

const start = (s: S) =>
  s.user.client.rpc("start_exam", { p_enrollment_id: s.enrollmentId });

async function correctMap(ids: string[]) {
  const { data } = await serviceClient
    .from("answer_options")
    .select("id, question_id, is_correct")
    .in("question_id", ids);
  return data ?? [];
}

async function answerAll(p: Payload, wrong: number) {
  const opts = await correctMap(p.questions.map((q) => q.id));
  const answers: Record<string, string> = {};
  p.questions.forEach((q, i) => {
    const want = i >= wrong; // first `wrong` questions answered incorrectly
    answers[q.id] = opts.find(
      (o) => o.question_id === q.id && o.is_correct === want,
    )!.id;
  });
  return answers;
}

describe("final exam", () => {
  it("is not available before the quizzes and the minimum time", async () => {
    const s = await enrolledStudent(courseId, countyId);
    const { data, error: error0 } = await s.user.client.rpc(
      "exam_eligibility",
      {
        p_enrollment_id: s.enrollmentId,
      },
    );
    expect(error0).toBeNull();
    const e = data as { eligible: boolean; reasons: string[] };
    expect(e.eligible).toBe(false);
    expect(e.reasons).toContain("sections_incomplete");
    expect(e.reasons).toContain("min_time");
    const { error } = await start(s as unknown as S);
    expect(error?.message).toContain("sections_incomplete");
  });

  it("start returns 25 questions with no correctness and locks details", async () => {
    const s = await ready();
    const { data, error } = await start(s);
    expect(error).toBeNull();
    const p = data as Payload;
    expect(p.questions).toHaveLength(25);
    const json = JSON.stringify(data);
    expect(json).not.toContain("is_correct");
    expect(json).not.toContain("explanation");
    expect(json).not.toContain('"correct"');

    const { data: profile } = await serviceClient
      .from("profiles")
      .select("details_locked_at")
      .eq("user_id", s.user.id)
      .single();
    expect(profile?.details_locked_at).not.toBeNull();
    const { error: upd } = await s.user.client
      .from("profiles")
      .update({ legal_name: "Someone Else" })
      .eq("user_id", s.user.id);
    const { data: after } = await serviceClient
      .from("profiles")
      .select("legal_name")
      .eq("user_id", s.user.id)
      .single();
    expect(after?.legal_name).toBe("Alex Driver");
    void upd;

    // One active session: the same attempt and questions come back.
    const again = (await start(s)).data as Payload;
    expect(again.attemptId).toBe(p.attemptId);
    expect(again.questions.map((q) => q.id)).toEqual(
      p.questions.map((q) => q.id),
    );
  });

  it("grades on the server: all correct passes and completes the enrollment", async () => {
    const s = await ready();
    const p = (await start(s)).data as Payload;
    const answers = await answerAll(p, 0);
    for (const [q, o] of Object.entries(answers)) {
      const { error } = await s.user.client.rpc("save_exam_answer", {
        p_attempt_id: p.attemptId,
        p_question_id: q,
        p_option_id: o,
      });
      expect(error).toBeNull();
    }
    const { data, error } = await s.user.client.rpc("submit_exam", {
      p_attempt_id: p.attemptId,
    });
    expect(error).toBeNull();
    expect(data).toEqual({
      score: 25,
      total: 25,
      passed: true,
      attemptsLeft: 1,
    });
    const { data: enr } = await serviceClient
      .from("enrollments")
      .select("status, completed_at")
      .eq("id", s.enrollmentId)
      .single();
    expect(enr?.status).toBe("completed");
    expect(enr?.completed_at).not.toBeNull();

    const review = await s.user.client.rpc("exam_review", {
      p_attempt_id: p.attemptId,
    });
    expect(review.error).toBeNull();
  });

  it("17 of 25 fails, attempt 2 uses different questions, 2 fails lock the enrollment", async () => {
    const s = await ready();
    const p1 = (await start(s)).data as Payload;
    const r1 = await s.user.client.rpc("submit_exam", {
      p_attempt_id: p1.attemptId,
      p_answers: await answerAll(p1, 8),
    });
    expect(r1.data).toEqual({
      score: 17,
      total: 25,
      passed: false,
      attemptsLeft: 1,
    });
    const review = await s.user.client.rpc("exam_review", {
      p_attempt_id: p1.attemptId,
    });
    expect(review.error).not.toBeNull();

    const p2 = (await start(s)).data as Payload;
    expect(p2.attemptNo).toBe(2);
    const first = new Set(p1.questions.map((q) => q.id));
    expect(p2.questions.some((q) => first.has(q.id))).toBe(false);
    const r2 = await s.user.client.rpc("submit_exam", {
      p_attempt_id: p2.attemptId,
      p_answers: await answerAll(p2, 25),
    });
    expect(r2.data).toMatchObject({ passed: false, attemptsLeft: 0 });
    const { data: enr } = await serviceClient
      .from("enrollments")
      .select("status")
      .eq("id", s.enrollmentId)
      .single();
    expect(enr?.status).toBe("locked");
    expect((await start(s)).error).not.toBeNull();
  });

  it("another student cannot read, answer or submit the attempt", async () => {
    const s = await ready();
    const p = (await start(s)).data as Payload;
    const other = await signInAsStudent();
    const q = p.questions[0];
    const save = await other.client.rpc("save_exam_answer", {
      p_attempt_id: p.attemptId,
      p_question_id: q.id,
      p_option_id: q.options[0].id,
    });
    expect(save.error).not.toBeNull();
    const sub = await other.client.rpc("submit_exam", {
      p_attempt_id: p.attemptId,
    });
    expect(sub.error).not.toBeNull();
    const rest = await s.user.client
      .from("exam_attempts")
      .select("id")
      .eq("id", p.attemptId);
    expect(rest.data).toEqual([]);
  });
});
