import { describe, expect, it } from "vitest";
import { buildExport } from "./export";

const empty = {
  profile: null,
  enrollments: [],
  orders: [],
  examAttempts: [],
  quizAttempts: [],
  certificates: [],
  reports: [],
  tickets: [],
  aiConversations: [],
};

describe("buildExport", () => {
  it("drops regulator refs, answer hashes and unsubmitted attempts", () => {
    const out = buildExport({
      ...empty,
      reports: [{ id: "r1", status: "accepted", regulator_ref: "SECRET" }],
      examAttempts: [
        { id: "a1", submitted_at: "2026-01-01", answer_hash: "h", score: 20 },
        { id: "a2", submitted_at: null, score: null },
      ],
    });
    const json = JSON.stringify(out);
    expect(json).not.toContain("SECRET");
    expect(json).not.toContain("answer_hash");
    expect(out.examAttempts).toHaveLength(1);
    expect(out.reports[0]).toEqual({ id: "r1", status: "accepted" });
  });
});
