import { describe, expect, it } from "vitest";
import { parseBlockForm } from "./block-form";

const form = (values: Record<string, string>) => (name: string) =>
  values[name] ?? "";

describe("parseBlockForm", () => {
  it("builds rich text for the filled languages only", () => {
    const res = parseBlockForm(
      "rich_text",
      form({ "en.markdown": "Hello", "ru.markdown": "Привет" }),
    );
    expect(res).toEqual({
      ok: true,
      content: { en: { markdown: "Hello" }, ru: { markdown: "Привет" } },
    });
  });

  it("requires English", () => {
    const res = parseBlockForm("rich_text", form({ "ja.markdown": "x" }));
    expect(res).toMatchObject({ ok: false, locale: "en" });
  });

  it("ignores select-only values in an untranslated language", () => {
    const res = parseBlockForm(
      "callout",
      form({
        "en.tone": "tip",
        "en.title": "T",
        "en.markdown": "M",
        "es.tone": "info",
      }),
    );
    expect(res.ok && Object.keys(res.content)).toEqual(["en"]);
  });

  it("reports a half-filled language", () => {
    const res = parseBlockForm(
      "flip_card",
      form({ "en.front": "F", "en.back": "B", "ja.front": "表" }),
    );
    expect(res).toMatchObject({ ok: false, locale: "ja" });
  });

  it("reads scenario choice rows and the best one", () => {
    const res = parseBlockForm(
      "scenario",
      form({
        "en.prompt": "P",
        "en.choice0.text": "A",
        "en.choice0.feedback": "fa",
        "en.choice2.text": "B",
        "en.choice2.feedback": "fb",
        "en.best": "2",
      }),
    );
    expect(res).toEqual({
      ok: true,
      content: {
        en: {
          prompt: "P",
          choices: [
            { text: "A", feedback: "fa", best: false },
            { text: "B", feedback: "fb", best: true },
          ],
        },
      },
    });
  });

  it("reads drag-to-order items one per line", () => {
    const res = parseBlockForm(
      "drag_to_order",
      form({ "en.prompt": "Order", "en.items": "one\n\n two \nthree" }),
    );
    expect(res.ok && res.content.en).toEqual({
      prompt: "Order",
      items: ["one", "two", "three"],
    });
  });

  it("drops an empty optional caption", () => {
    const res = parseBlockForm(
      "image",
      form({
        "en.src": "/placeholder/course/tire-check.svg",
        "en.alt": "Tire",
        "en.caption": "",
      }),
    );
    expect(res.ok && res.content.en).toEqual({
      src: "/placeholder/course/tire-check.svg",
      alt: "Tire",
    });
  });
});
