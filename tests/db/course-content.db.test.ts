import { describe, expect, it } from "vitest";
import { serviceClient, visitor } from "../support/users";

const LOCALES = ["en", "ja", "es", "ru"] as const;
const BLOCK_TYPES = [
  "rich_text",
  "image",
  "video",
  "callout",
  "flip_card",
  "scenario",
  "drag_to_order",
];

describe("seeded course content", () => {
  it("has 8 sections with 3 lessons each and a block-rich 24-lesson course", async () => {
    const { data, error } = await serviceClient
      .from("lessons")
      .select("section_id, position, min_seconds");
    expect(error).toBeNull();
    expect(data).toHaveLength(24);
    expect(data?.every((l) => l.min_seconds === 60)).toBe(true);
    const perSection = new Map<string, number>();
    for (const l of data ?? []) {
      perSection.set(l.section_id, (perSection.get(l.section_id) ?? 0) + 1);
    }
    expect(perSection.size).toBe(8);
    expect([...perSection.values()].every((n) => n === 3)).toBe(true);
  });

  it("has every block type with all four languages", async () => {
    const { data, error } = await serviceClient
      .from("lesson_blocks")
      .select("type, content");
    expect(error).toBeNull();
    expect(new Set(data?.map((b) => b.type))).toEqual(new Set(BLOCK_TYPES));
    for (const block of data ?? []) {
      expect(Object.keys(block.content as object).sort()).toEqual(
        [...LOCALES].sort(),
      );
    }
  });

  it("has 10 quiz questions per section per language and a 60+ exam pool", async () => {
    const { data, error } = await serviceClient
      .from("questions")
      .select("id, section_id, locale");
    expect(error).toBeNull();
    const counts = new Map<string, number>();
    for (const q of data ?? []) {
      const key = `${q.section_id ?? "exam"}:${q.locale}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const sectionKeys = [...counts.keys()].filter(
      (k) => !k.startsWith("exam:"),
    );
    expect(sectionKeys).toHaveLength(8 * 4);
    for (const key of sectionKeys) expect(counts.get(key)).toBe(10);
    for (const locale of LOCALES) {
      expect(counts.get(`exam:${locale}`)).toBeGreaterThanOrEqual(60);
    }
  });

  it("gives every question exactly one correct option of four", async () => {
    // PostgREST caps a response at 1000 rows, so read the options in pages.
    const data: { question_id: string; is_correct: boolean }[] = [];
    for (let from = 0; ; from += 1000) {
      const page = await serviceClient
        .from("answer_options")
        .select("question_id, is_correct")
        .order("id")
        .range(from, from + 999);
      expect(page.error).toBeNull();
      data.push(...(page.data ?? []));
      if ((page.data?.length ?? 0) < 1000) break;
    }
    const byQuestion = new Map<string, { total: number; correct: number }>();
    for (const o of data ?? []) {
      const entry = byQuestion.get(o.question_id) ?? { total: 0, correct: 0 };
      entry.total += 1;
      if (o.is_correct) entry.correct += 1;
      byQuestion.set(o.question_id, entry);
    }
    const { count } = await serviceClient
      .from("questions")
      .select("id", { count: "exact", head: true });
    expect(byQuestion.size).toBe(count);
    for (const entry of byQuestion.values()) {
      expect(entry).toEqual({ total: 4, correct: 1 });
    }
  });

  it("sets California's minimum course minutes to the lessons' total", async () => {
    const { data, error } = await visitor()
      .from("states")
      .select("min_course_minutes")
      .eq("code", "CA")
      .single();
    expect(error).toBeNull();
    expect(data?.min_course_minutes).toBe(24);
  });

  it("keeps correct answers hidden from a Visitor", async () => {
    const { data } = await visitor().from("answer_options").select("id");
    expect(data ?? []).toHaveLength(0);
  });
});
