import { describe, expect, it } from "vitest";
import { visitor } from "../support/users";

describe("seeded states", () => {
  it("lets a Visitor read California's course rules", async () => {
    const { data, error } = await visitor()
      .from("states")
      .select(
        "code, name, exam_questions, pass_pct, max_attempts, access_days, report_times, active",
      )
      .eq("code", "CA")
      .single();

    expect(error).toBeNull();
    expect(data).toEqual({
      code: "CA",
      name: "California",
      exam_questions: 25,
      pass_pct: 70,
      max_attempts: 2,
      access_days: 90,
      report_times: ["09:00", "13:00", "17:00"],
      active: true,
    });
  });

  it("lists other states as inactive", async () => {
    const { data, error } = await visitor()
      .from("states")
      .select("code, active")
      .neq("code", "CA");

    expect(error).toBeNull();
    expect(data?.length).toBeGreaterThan(0);
    expect(data?.every((state) => !state.active)).toBe(true);
  });
});

describe("the seeded course", () => {
  it("lets a Visitor read the California course and its eight sections in every UI language", async () => {
    const { data, error } = await visitor()
      .from("courses")
      .select(
        "state_code, price_cents, list_price_cents, active, sections(position, title)",
      )
      .eq("slug", "california-traffic-violator-course")
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      state_code: "CA",
      price_cents: 2499,
      list_price_cents: 3499,
      active: true,
    });
    const sections = [...(data?.sections ?? [])].sort(
      (a, b) => a.position - b.position,
    );
    expect(sections.map((section) => section.position)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
    expect(sections[0]?.title).toMatchObject({
      en: "Traffic Safety Fundamentals",
    });
    expect(sections[7]?.title).toMatchObject({
      en: "Course Review and Final Steps",
    });
    for (const section of sections) {
      expect(Object.keys(section.title as object).sort()).toEqual([
        "en",
        "es",
        "ja",
        "ru",
      ]);
    }
  });
});
