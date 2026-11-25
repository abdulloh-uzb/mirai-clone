import { describe, expect, it } from "vitest";
import { pickTranslation, pickTranslations } from "./translation";

const en = { locale: "en", slug: "a", title: "Hello" };
const ru = { locale: "ru", slug: "a", title: "Привет" };

describe("pickTranslation", () => {
  it("returns the requested language's row", () => {
    expect(pickTranslation([en, ru], "ru")).toEqual({
      item: ru,
      isFallback: false,
      availableLocales: ["en", "ru"],
    });
  });

  it("falls back to English and flags it", () => {
    expect(pickTranslation([en, ru], "ja")).toEqual({
      item: en,
      isFallback: true,
      availableLocales: ["en", "ru"],
    });
  });

  it("returns null when neither the language nor English exists", () => {
    expect(pickTranslation([ru], "ja")).toBeNull();
    expect(pickTranslation([], "en")).toBeNull();
  });

  it("ignores rows in unknown languages", () => {
    expect(pickTranslation([{ locale: "de", slug: "a" }], "en")).toBeNull();
  });
});

describe("pickTranslations", () => {
  it("picks one row per slug, keeping first-seen order", () => {
    const enB = { locale: "en", slug: "b", title: "B" };
    const result = pickTranslations([enB, en, ru], "ru");
    expect(result.map((r) => [r.slug, r.item.title, r.isFallback])).toEqual([
      ["b", "B", true],
      ["a", "Привет", false],
    ]);
  });

  it("drops slugs with no row in the language or English", () => {
    const jaOnly = { locale: "ja", slug: "c", title: "C" };
    expect(pickTranslations([jaOnly], "ru")).toEqual([]);
  });
});
