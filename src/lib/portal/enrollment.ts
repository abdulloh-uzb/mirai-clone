import "server-only";
import {
  parseBlockContent,
  type BlockContentByType,
  type BlockType,
} from "@/lib/course/blocks";
import { computeOutline, type OutlineSection } from "@/lib/course/outline";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

// Server-only reads for the Student's own enrollment, always with the user's
// client so RLS applies. lesson_blocks are never read with the service client.

export type CurrentEnrollment = {
  id: string;
  courseId: string;
  courseLocale: string;
  status: string;
  startedAt: string | null;
  expiresAt: string | null;
  courtDueDate: string | null;
};

/** The Student's latest enrollment that is not refunded, or null. */
export async function getCurrentEnrollment(): Promise<CurrentEnrollment | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;
  const { data } = await supabase
    .from("enrollments")
    .select(
      "id, course_id, course_locale, status, started_at, expires_at, court_due_date",
    )
    .eq("user_id", userId)
    .neq("status", "refunded")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    courseId: data.course_id,
    courseLocale: data.course_locale,
    status: data.status,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    courtDueDate: data.court_due_date,
  };
}

/** One enrollment by id, only if it belongs to the signed-in Student. */
export async function getEnrollment(
  enrollmentId: string,
): Promise<CurrentEnrollment | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("enrollments")
    .select(
      "id, course_id, course_locale, status, started_at, expires_at, court_due_date",
    )
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    courseId: data.course_id,
    courseLocale: data.course_locale,
    status: data.status,
    startedAt: data.started_at,
    expiresAt: data.expires_at,
    courtDueDate: data.court_due_date,
  };
}

function pick(json: unknown, locale: string): string {
  const obj =
    typeof json === "object" && json !== null
      ? (json as Record<string, unknown>)
      : {};
  const own = obj[locale];
  if (typeof own === "string" && own) return own;
  return typeof obj.en === "string" ? obj.en : "";
}

/** Sections and lessons titled in the Course language, with the Student's progress. */
export async function getCourseOutline(
  enrollment: Pick<CurrentEnrollment, "id" | "courseId" | "courseLocale">,
  client?: SupabaseClient<Database>,
): Promise<OutlineSection[]> {
  // Admin "view as student" passes the service client; Students use their own.
  const supabase = client ?? (await createClient());
  const [sections, progress, quizzes] = await Promise.all([
    supabase
      .from("sections")
      .select("id, position, title, lessons(id, position, title, min_seconds)")
      .eq("course_id", enrollment.courseId)
      .order("position"),
    supabase
      .from("lesson_progress")
      .select("lesson_id, seconds_spent, completed_at")
      .eq("enrollment_id", enrollment.id),
    supabase
      .from("quiz_attempts")
      .select("section_id")
      .eq("enrollment_id", enrollment.id)
      .eq("passed", true),
  ]);
  const rows = sections.data ?? [];
  return computeOutline({
    sections: rows.map((s) => ({
      id: s.id,
      position: s.position,
      title: pick(s.title, enrollment.courseLocale),
    })),
    lessons: rows.flatMap((s) =>
      s.lessons.map((l) => ({
        id: l.id,
        sectionId: s.id,
        position: l.position,
        title: pick(l.title, enrollment.courseLocale),
        minSeconds: l.min_seconds,
      })),
    ),
    progress: (progress.data ?? []).map((p) => ({
      lessonId: p.lesson_id,
      secondsSpent: p.seconds_spent,
      completedAt: p.completed_at,
    })),
    passedQuizSectionIds: new Set(
      (quizzes.data ?? []).map((q) => q.section_id),
    ),
  });
}

export type LessonBlock = {
  id: string;
  position: number;
  type: BlockType;
  content: BlockContentByType[BlockType];
};

/** The blocks of one lesson, parsed in the Course language. */
export async function getLessonBlocks(
  lessonId: string,
  courseLocale: string,
): Promise<LessonBlock[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lesson_blocks")
    .select("id, position, type, content")
    .eq("lesson_id", lessonId)
    .order("position");
  return (data ?? []).map((b) => {
    const type = b.type as BlockType;
    return {
      id: b.id,
      position: b.position,
      type,
      content: parseBlockContent(type, b.content, courseLocale),
    };
  });
}
