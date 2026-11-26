import { describe, expect, it } from "vitest";
import { parseStageParam, STUDENT_STAGES } from "./stages";

describe("stages", () => {
  it("parses a known stage", () => {
    expect(parseStageParam("reported")).toBe("reported");
  });

  it("ignores anything else", () => {
    expect(parseStageParam("bogus")).toBeUndefined();
    expect(parseStageParam(undefined)).toBeUndefined();
    expect(parseStageParam(["reported"])).toBeUndefined();
  });

  it("lists the stages in funnel order", () => {
    expect([...STUDENT_STAGES]).toEqual([
      "registered",
      "studying",
      "needs_attention",
      "completed",
      "reported",
    ]);
  });
});
