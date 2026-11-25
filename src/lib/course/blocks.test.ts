import { describe, expect, it } from "vitest";
import { blockContentSchema, parseBlockContent } from "./blocks";

describe("block schemas", () => {
  it("accepts valid samples and rejects bad ones", () => {
    const ok = (type: Parameters<typeof blockContentSchema>[0], v: unknown) =>
      blockContentSchema(type).safeParse(v).success;

    expect(ok("rich_text", { markdown: "Hi" })).toBe(true);
    expect(ok("rich_text", { markdown: "" })).toBe(false);
    expect(ok("image", { src: "/placeholder/course/a.svg", alt: "x" })).toBe(
      true,
    );
    expect(ok("image", { src: "https://x.test/a.png", alt: "x" })).toBe(false);
    expect(
      ok("video", {
        title: "t",
        captionsSrc: "/placeholder/course/captions/a.en.vtt",
        transcript: "words",
      }),
    ).toBe(true);
    expect(ok("video", { title: "t" })).toBe(false);
    expect(ok("callout", { tone: "info", title: "a", markdown: "b" })).toBe(
      true,
    );
    expect(ok("callout", { tone: "loud", title: "a", markdown: "b" })).toBe(
      false,
    );
    expect(ok("flip_card", { front: "a", back: "b" })).toBe(true);
    expect(ok("flip_card", { front: "a" })).toBe(false);
    expect(ok("drag_to_order", { prompt: "p", items: ["a", "b"] })).toBe(true);
    expect(ok("drag_to_order", { prompt: "p", items: ["a"] })).toBe(false);
  });

  it("requires exactly one best scenario choice", () => {
    const choice = (best: boolean) => ({ text: "t", feedback: "f", best });
    const schema = blockContentSchema("scenario");
    const ok = (choices: unknown[]) =>
      schema.safeParse({ prompt: "p", choices }).success;
    expect(ok([choice(true), choice(false)])).toBe(true);
    expect(ok([choice(true), choice(true)])).toBe(false);
    expect(ok([choice(false), choice(false)])).toBe(false);
  });
});

describe("parseBlockContent", () => {
  const content = { en: { markdown: "Hello" }, ja: { markdown: "こんにちは" } };

  it("returns the locale's content", () => {
    expect(parseBlockContent("rich_text", content, "ja")).toEqual({
      markdown: "こんにちは",
    });
  });

  it("falls back to English", () => {
    expect(parseBlockContent("rich_text", content, "ru")).toEqual({
      markdown: "Hello",
    });
  });
});
