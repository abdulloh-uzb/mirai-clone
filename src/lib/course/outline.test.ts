import { describe, expect, it } from "vitest";
import { computeOutline, nextLesson, progressPct } from "./outline";

const sections = [
  { id: "s2", position: 2, title: "Two" },
  { id: "s1", position: 1, title: "One" },
];
const lessons = [
  { id: "l11", sectionId: "s1", position: 1, title: "a", minSeconds: 60 },
  { id: "l12", sectionId: "s1", position: 2, title: "b", minSeconds: 60 },
  { id: "l21", sectionId: "s2", position: 1, title: "c", minSeconds: 60 },
];
const done = (id: string) => ({
  lessonId: id,
  secondsSpent: 60,
  completedAt: "2026-01-01",
});

describe("computeOutline", () => {
  it("opens only the first lesson of a fresh course", () => {
    const o = computeOutline({ sections, lessons, progress: [] });
    expect(o.map((s) => s.status)).toEqual(["available", "locked"]);
    expect(o[0].lessons.map((l) => l.status)).toEqual(["available", "locked"]);
    expect(nextLesson(o)?.lesson.id).toBe("l11");
    expect(progressPct(o)).toBe(0);
  });
  it("unlocks in order", () => {
    const o = computeOutline({ sections, lessons, progress: [done("l11")] });
    expect(o[0].lessons.map((l) => l.status)).toEqual([
      "completed",
      "available",
    ]);
    expect(o[1].status).toBe("locked");
    expect(progressPct(o)).toBe(33);
  });
  it("opens the next section when the previous is done", () => {
    const o = computeOutline({
      sections,
      lessons,
      progress: [done("l11"), done("l12")],
    });
    expect(o[0].status).toBe("completed");
    expect(o[1].status).toBe("available");
    expect(nextLesson(o)?.lesson.id).toBe("l21");
  });
  it("requires the quiz when passed ids are given", () => {
    const progress = [done("l11"), done("l12")];
    const without = computeOutline({
      sections,
      lessons,
      progress,
      passedQuizSectionIds: new Set(),
    });
    expect(without[0].status).toBe("available");
    expect(without[1].status).toBe("locked");
    const withQuiz = computeOutline({
      sections,
      lessons,
      progress,
      passedQuizSectionIds: new Set(["s1"]),
    });
    expect(withQuiz[1].status).toBe("available");
  });
  it("returns null next lesson and 100% when all done", () => {
    const o = computeOutline({
      sections,
      lessons,
      progress: ["l11", "l12", "l21"].map(done),
    });
    expect(nextLesson(o)).toBeNull();
    expect(progressPct(o)).toBe(100);
  });
});
