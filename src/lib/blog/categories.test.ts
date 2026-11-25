import { describe, expect, it } from "vitest";
import { coverImage, isPostCategory, POST_CATEGORIES } from "./categories";

describe("post categories", () => {
  it("recognizes only the three categories", () => {
    expect(POST_CATEGORIES).toEqual([
      "traffic-school",
      "california-driving",
      "after-your-ticket",
    ]);
    expect(isPostCategory("california-driving")).toBe(true);
    expect(isPostCategory("cooking")).toBe(false);
    expect(isPostCategory(undefined)).toBe(false);
  });

  it("gives each category its own cover", () => {
    expect(coverImage("after-your-ticket")).toBe(
      "/placeholder/blog-after-your-ticket.svg",
    );
  });
});
