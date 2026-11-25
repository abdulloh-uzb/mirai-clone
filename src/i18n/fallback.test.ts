import { describe, expect, it } from "vitest";
import { withEnglishFallback } from "./fallback";

describe("withEnglishFallback", () => {
  it("keeps translated strings and fills missing ones from English", () => {
    const english = {
      Header: { courses: "Courses", blog: "Blog" },
      NotFound: { title: "This page took a wrong turn" },
    };
    const russian = { Header: { courses: "Курсы" } };

    expect(withEnglishFallback(english, russian)).toEqual({
      Header: { courses: "Курсы", blog: "Blog" },
      NotFound: { title: "This page took a wrong turn" },
    });
  });

  it("ignores keys that English does not have", () => {
    expect(
      withEnglishFallback({ A: { b: "B" } }, { A: { b: "Б", extra: "x" } }),
    ).toEqual({ A: { b: "Б" } });
  });
});
