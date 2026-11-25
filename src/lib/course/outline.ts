// Pure mirror of the SQL unlock rules (section_unlocked / lesson_unlocked).
// Ticket 04 passes `passedQuizSectionIds` once section quizzes exist.

export type OutlineSectionInput = {
  id: string;
  position: number;
  title: string;
};
export type OutlineLessonInput = {
  id: string;
  sectionId: string;
  position: number;
  title: string;
  minSeconds: number;
};
export type ProgressInput = {
  lessonId: string;
  secondsSpent: number;
  completedAt: string | null;
};

export type Status = "locked" | "available" | "completed";

export type OutlineLesson = OutlineLessonInput & {
  status: Status;
  secondsSpent: number;
};
export type OutlineSection = OutlineSectionInput & {
  status: Status;
  lessons: OutlineLesson[];
};

export function computeOutline({
  sections,
  lessons,
  progress,
  passedQuizSectionIds,
}: {
  sections: OutlineSectionInput[];
  lessons: OutlineLessonInput[];
  progress: ProgressInput[];
  passedQuizSectionIds?: ReadonlySet<string>;
}): OutlineSection[] {
  const byLesson = new Map(progress.map((p) => [p.lessonId, p]));
  const ordered = [...sections].sort((a, b) => a.position - b.position);
  let previousDone = true;
  return ordered.map((section) => {
    const own = lessons
      .filter((l) => l.sectionId === section.id)
      .sort((a, b) => a.position - b.position);
    const sectionOpen = previousDone;
    let earlierDone = true;
    const outLessons = own.map((lesson): OutlineLesson => {
      const p = byLesson.get(lesson.id);
      const done = !!p?.completedAt;
      const status: Status = done
        ? "completed"
        : sectionOpen && earlierDone
          ? "available"
          : "locked";
      earlierDone = earlierDone && done;
      return { ...lesson, status, secondsSpent: p?.secondsSpent ?? 0 };
    });
    const allDone = outLessons.every((l) => l.status === "completed");
    const quizOk =
      !passedQuizSectionIds || passedQuizSectionIds.has(section.id);
    previousDone = sectionOpen && allDone && quizOk;
    const status: Status = !sectionOpen
      ? "locked"
      : allDone && quizOk
        ? "completed"
        : "available";
    return { ...section, status, lessons: outLessons };
  });
}

/** The first available (not completed) lesson, or null when everything is done. */
export function nextLesson(
  outline: OutlineSection[],
): { section: OutlineSection; lesson: OutlineLesson } | null {
  for (const section of outline) {
    for (const lesson of section.lessons) {
      if (lesson.status === "available") return { section, lesson };
    }
  }
  return null;
}

/** Percent of lessons completed, 0 to 100. */
export function progressPct(outline: OutlineSection[]): number {
  const all = outline.flatMap((s) => s.lessons);
  if (all.length === 0) return 0;
  const done = all.filter((l) => l.status === "completed").length;
  return Math.round((done / all.length) * 100);
}
