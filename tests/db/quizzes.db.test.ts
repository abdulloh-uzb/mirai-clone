import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  completeLessons,
  deleteQuestions,
  enrolledStudent,
  loadCourse,
  seedQuestions,
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
const seeded: string[] = [];

beforeAll(async () => {
  ({ courseId, countyId, lessons, sections } = await loadCourse());
  seeded.push(
    ...(await seedQuestions(sections[0].id, 10)),
    ...(await seedQuestions(sections[1].id, 10)),
  );
});

afterAll(async () => {
  await deleteQuestions(seeded);
  await deleteTestUsers();
});

const sectionLessons = (n: number) => lessons.filter((l) => l.section === n);

// Completes section 1 without crossing the identity-check milestone (3 lessons).
async function ready() {
  const s = await enrolledStudent(courseId, countyId);
  await completeLessons(s.enrollmentId, sectionLessons(1));
  if (sectionLessons(1).length >= 3) {
    await serviceClient.from("identity_checks").insert(
      Array.from({ length: 4 }, () => ({
        enrollment_id: s.enrollmentId,
        question_key: "dob",
        correct: true,
      })),
    );
  }
  return s;
}

type Payload = {
  attemptId: string;
  questions: { id: string; text: string; options: { id: string }[] }[];
};

async function answers(payload: Payload, correct: boolean) {
  const out: Record<string, string> = {};
  for (const q of payload.questions) {
    const { data } = await serviceClient
      .from("answer_options")
      .select("id, is_correct")
      .eq("question_id", q.id);
    out[q.id] = data!.find((o) => o.is_correct === correct)!.id;
  }
  return out;
}

describe("section quizzes", () => {
  it("refuses to start before the lessons are done", async () => {
    const s = await enrolledStudent(courseId, countyId);
    const { error } = await s.user.client.rpc("start_quiz", {
      p_enrollment_id: s.enrollmentId,
      p_section_position: 1,
    });
    expect(error?.message).toContain("lessons_incomplete");
  });

  it("starts with 8 questions and no correctness anywhere; restart returns the same attempt", async () => {
    const s = await ready();
    const first = await s.user.client.rpc("start_quiz", {
      p_enrollment_id: s.enrollmentId,
      p_section_position: 1,
    });
    expect(first.error).toBeNull();
    const payload = first.data as unknown as Payload;
    expect(payload.questions).toHaveLength(8);
    const raw = JSON.stringify(first.data);
    expect(raw).not.toMatch(/is_?correct/i);
    expect(raw).not.toContain("explanation");
    const again = await s.user.client.rpc("start_quiz", {
      p_enrollment_id: s.enrollmentId,
      p_section_position: 1,
    });
    expect((again.data as unknown as Payload).attemptId).toBe(
      payload.attemptId,
    );
    // An unsubmitted attempt is not readable through REST.
    const { data: rows } = await s.user.client
      .from("quiz_attempts")
      .select("id");
    expect(rows).toHaveLength(0);
  });

  it("grades on the server, passes at 70 percent, retry gives a new attempt, unlocks section 2", async () => {
    const s = await ready();
    const start = () =>
      s.user.client.rpc("start_quiz", {
        p_enrollment_id: s.enrollmentId,
        p_section_position: 1,
      });
    const unlocked = () =>
      s.user.client.rpc("section_unlocked", {
        p_enrollment_id: s.enrollmentId,
        p_section_position: 2,
      });
    const p1 = (await start()).data as unknown as Payload;
    const fail = await s.user.client.rpc("submit_quiz", {
      p_attempt_id: p1.attemptId,
      p_answers: await answers(p1, false),
    });
    expect(fail.error).toBeNull();
    expect(fail.data).toMatchObject({ score: 0, total: 8, passed: false });
    expect((await unlocked()).data).toBe(false);

    const p2 = (await start()).data as unknown as Payload;
    expect(p2.attemptId).not.toBe(p1.attemptId);
    const good = await answers(p2, true);
    const wrong = await answers(p2, false);
    // 6 of 8 = 75 percent passes.
    for (const id of Object.keys(good).slice(0, 2)) good[id] = wrong[id];
    const pass = await s.user.client.rpc("submit_quiz", {
      p_attempt_id: p2.attemptId,
      p_answers: good,
    });
    expect(pass.data).toMatchObject({ score: 6, total: 8, passed: true });
    const results = (pass.data as { results: { explanation: string }[] })
      .results;
    expect(results[0].explanation.length).toBeGreaterThan(0);
    expect((await unlocked()).data).toBe(true);

    const again = await s.user.client.rpc("submit_quiz", {
      p_attempt_id: p2.attemptId,
      p_answers: good,
    });
    expect(again.error?.message).toContain("already_submitted");
  });

  it("fails below 70 percent", async () => {
    const s = await ready();
    const p = (
      await s.user.client.rpc("start_quiz", {
        p_enrollment_id: s.enrollmentId,
        p_section_position: 1,
      })
    ).data as unknown as Payload;
    const good = await answers(p, true);
    const wrong = await answers(p, false);
    for (const id of Object.keys(good).slice(0, 3)) good[id] = wrong[id];
    const res = await s.user.client.rpc("submit_quiz", {
      p_attempt_id: p.attemptId,
      p_answers: good,
    });
    expect(res.data).toMatchObject({ score: 5, passed: false });
  });

  it("does not let another student submit the attempt", async () => {
    const s = await ready();
    const p = (
      await s.user.client.rpc("start_quiz", {
        p_enrollment_id: s.enrollmentId,
        p_section_position: 1,
      })
    ).data as unknown as Payload;
    const other = await signInAsStudent();
    const { error } = await other.client.rpc("submit_quiz", {
      p_attempt_id: p.attemptId,
      p_answers: {},
    });
    expect(error?.message).toContain("attempt_not_found");
  });
});
