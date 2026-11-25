import { describe, expect, it } from "vitest";
import { shuffleSeeded } from "./shuffle";

const items = ["a", "b", "c", "d", "e"];

describe("shuffleSeeded", () => {
  it("is deterministic and a permutation", () => {
    const one = shuffleSeeded(items, "block-1");
    expect(shuffleSeeded(items, "block-1")).toEqual(one);
    expect([...one].sort()).toEqual(items);
  });
  it("never returns the solved order", () => {
    for (const seed of ["x", "y", "z", "1", "2", "3"]) {
      expect(shuffleSeeded(items, seed)).not.toEqual(items);
    }
  });
});
