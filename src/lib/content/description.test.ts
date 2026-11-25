import { describe, expect, it } from "vitest";
import { describeMarkdown } from "./description";

describe("describeMarkdown", () => {
  it("strips Markdown syntax and collapses whitespace", () => {
    expect(
      describeMarkdown(
        "**Demo text.**\n\n## Your account\n\n- See [terms](/terms).",
      ),
    ).toBe("Demo text. Your account See terms.");
  });

  it("keeps short text whole", () => {
    expect(describeMarkdown("Short.", 160)).toBe("Short.");
  });

  it("cuts long text at a word boundary with an ellipsis", () => {
    const result = describeMarkdown("word ".repeat(100), 40);
    expect(result.length).toBeLessThanOrEqual(40);
    expect(result.endsWith("word…")).toBe(true);
  });
});
