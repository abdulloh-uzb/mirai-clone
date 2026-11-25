import { describe, expect, it } from "vitest";
import { buyHref, parseCourseLanguage } from "./course-language";

describe("parseCourseLanguage", () => {
  it("accepts the four Course languages", () => {
    for (const code of ["en", "ja", "es", "ru"]) {
      expect(parseCourseLanguage(code)).toBe(code);
    }
  });
  it("rejects anything else", () => {
    for (const value of ["fr", "", "EN", undefined, null, ["ja"], 3]) {
      expect(parseCourseLanguage(value)).toBeNull();
    }
  });
});

describe("buyHref", () => {
  it("sends a Visitor to sign-up and a Student to the Portal", () => {
    expect(buyHref("ja", false)).toBe("/signup?course=ja");
    expect(buyHref("ru", true)).toBe("/portal?course=ru");
  });
});
