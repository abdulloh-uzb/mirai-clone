import { serviceClient, signInAsStudent, type TestUser } from "./users";

// Course fixtures for DB tests: an enrollment with driver details, lesson
// completion shortcuts and a throwaway question bank.

export type LessonRef = { id: string; section: number; position: number };

export async function loadCourse(): Promise<{
  courseId: string;
  countyId: string;
  lessons: LessonRef[];
  sections: { id: string; position: number }[];
}> {
  const { data: county } = await serviceClient
    .from("counties")
    .select("id")
    .limit(1)
    .single();
  const { data: course } = await serviceClient
    .from("courses")
    .select("id")
    .limit(1)
    .single();
  const { data } = await serviceClient
    .from("lessons")
    .select("id, position, sections!inner(position, course_id)")
    .eq("sections.course_id", course!.id);
  const lessons = (data ?? [])
    .map((l) => ({
      id: l.id,
      position: l.position,
      section: l.sections.position,
    }))
    .sort((a, b) => a.section - b.section || a.position - b.position);
  const { data: secs } = await serviceClient
    .from("sections")
    .select("id, position")
    .eq("course_id", course!.id)
    .order("position");
  return {
    courseId: course!.id,
    countyId: county!.id,
    lessons,
    sections: secs ?? [],
  };
}

export async function enrolledStudent(
  courseId: string,
  countyId: string,
): Promise<{ user: TestUser; enrollmentId: string }> {
  const user = await signInAsStudent();
  const { data, error } = await serviceClient
    .from("enrollments")
    .insert({
      user_id: user.id,
      course_id: courseId,
      course_locale: "en",
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    })
    .select("id")
    .single();
  if (error) throw error;
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
  return { user, enrollmentId: data.id };
}

/** Marks lessons complete directly (setup only; skips the minimum time). */
export async function completeLessons(
  enrollmentId: string,
  lessons: LessonRef[],
): Promise<void> {
  const { error } = await serviceClient.from("lesson_progress").insert(
    lessons.map((l) => ({
      enrollment_id: enrollmentId,
      lesson_id: l.id,
      seconds_spent: 999,
      completed_at: new Date().toISOString(),
    })),
  );
  if (error) throw error;
}

/** Inserts `count` English questions (4 options, first one correct) for a section. */
export async function seedQuestions(
  sectionId: string,
  count: number,
  locale = "en",
): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const { data: q, error } = await serviceClient
      .from("questions")
      .insert({
        section_id: sectionId,
        locale,
        text: `Test question ${i}`,
        explanation: `Because ${i}`,
      })
      .select("id")
      .single();
    if (error) throw error;
    ids.push(q.id);
    await serviceClient.from("answer_options").insert(
      [0, 1, 2, 3].map((n) => ({
        question_id: q.id,
        text: `Option ${n}`,
        is_correct: n === 0,
      })),
    );
  }
  return ids;
}

export async function deleteQuestions(ids: string[]): Promise<void> {
  if (ids.length) await serviceClient.from("questions").delete().in("id", ids);
}
