import { describe, expect, it } from "vitest";
import { localePrefix, splitLocalePath } from "./locale-path";

describe("splitLocalePath", () => {
  it.each([
    ["/ja/portal", "ja", "/portal"],
    ["/ru", "ru", "/"],
    ["/es/", "es", "/"],
    ["/en/faq", "en", "/faq"],
    ["/ja?next=%2Fportal", "ja", "/?next=%2Fportal"],
    ["/ru/portal/lesson?x=1", "ru", "/portal/lesson?x=1"],
  ])("reads the UI language named in %s", (path, locale, rest) => {
    expect(splitLocalePath(path)).toEqual({ locale, path: rest });
  });

  it.each(["/", "/portal", "/japan", "/fr/faq", "/portal?lang=ja"])(
    "finds no UI language in %s",
    (path) => {
      expect(splitLocalePath(path)).toEqual({ locale: null, path });
    },
  );
});

describe("localePrefix", () => {
  it("is empty for English, which has no URL prefix", () => {
    expect(localePrefix("en")).toBe("");
  });

  it("is empty when no UI language is named", () => {
    expect(localePrefix(null)).toBe("");
  });

  it("is the language segment for other UI languages", () => {
    expect(localePrefix("ja")).toBe("/ja");
  });
});
