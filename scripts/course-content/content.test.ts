import { describe, expect, it } from "vitest";
import {
  BLOCK_TYPES,
  blockContentByLocaleSchema,
  COURSE_LOCALES,
} from "../../src/lib/course/blocks";
import { buildSql } from "../generate-course-seed";
import { examQuestions, sections } from "./index";

const INTERACTIVE = ["flip_card", "scenario", "drag_to_order"];

describe("course content", () => {
  it("has 8 sections with 3 lessons of 3 to 5 blocks", () => {
    expect(sections).toHaveLength(8);
    for (const { content } of sections) {
      expect(content.lessons).toHaveLength(3);
      for (const lesson of content.lessons) {
        expect(lesson.blocks.length).toBeGreaterThanOrEqual(3);
        expect(lesson.blocks.length).toBeLessThanOrEqual(5);
      }
    }
  });

  it("uses every block type and has an interactive block in each section", () => {
    const blocks = sections.flatMap((s) =>
      s.content.lessons.flatMap((l) => l.blocks),
    );
    expect(new Set(blocks.map((b) => b.type))).toEqual(new Set(BLOCK_TYPES));
    for (const { content } of sections) {
      const types = content.lessons.flatMap((l) => l.blocks.map((b) => b.type));
      expect(types.some((t) => INTERACTIVE.includes(t))).toBe(true);
    }
  });

  it("has every block valid in all 4 locales", () => {
    for (const { content } of sections) {
      for (const lesson of content.lessons) {
        for (const block of lesson.blocks) {
          expect(
            blockContentByLocaleSchema(block.type).safeParse(block.content)
              .success,
          ).toBe(true);
        }
      }
    }
  });

  it("has 10 quiz questions per section and a pool of at least 60 exam questions", () => {
    for (const { content } of sections) expect(content.quiz).toHaveLength(10);
    expect(examQuestions.length).toBeGreaterThanOrEqual(60);
  });

  it("has unique keys and exactly one correct option of four per question", () => {
    const all = [...sections.flatMap((s) => s.content.quiz), ...examQuestions];
    expect(new Set(all.map((q) => q.key)).size).toBe(all.length);
    for (const question of all) {
      expect(question.options).toHaveLength(4);
      expect(question.options.filter((o) => o.correct)).toHaveLength(1);
      for (const locale of COURSE_LOCALES) {
        expect(question.text[locale]).toBeTruthy();
        expect(question.options.every((o) => o.text[locale])).toBe(true);
      }
    }
  });

  it("generates deterministic SQL", () => {
    expect(buildSql()).toBe(buildSql());
  });
});
