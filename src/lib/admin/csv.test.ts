import { describe, expect, it } from "vitest";
import { buildCsv, csvField } from "./csv";

describe("csv", () => {
  it("leaves plain values alone and blanks null", () => {
    expect(csvField("abc")).toBe("abc");
    expect(csvField(null)).toBe("");
    expect(csvField(5)).toBe("5");
  });
  it("escapes commas, quotes and newlines", () => {
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField("a\nb")).toBe('"a\nb"');
  });
  it("builds rows with a header", () => {
    expect(buildCsv(["a", "b"], [["1", "x,y"]])).toBe('a,b\r\n1,"x,y"\r\n');
  });
});
