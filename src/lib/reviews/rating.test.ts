import { describe, expect, it } from "vitest";
import { aggregateRating, averageRating } from "./rating";

describe("averageRating", () => {
  it("rounds the mean to one decimal", () => {
    expect(averageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toBe(
      4.3,
    );
  });

  it("is null with no reviews", () => {
    expect(averageRating([])).toBeNull();
  });
});

describe("aggregateRating", () => {
  it("ignores Sample reviews, so samples alone give none", () => {
    expect(
      aggregateRating([
        { rating: 5, isSample: true },
        { rating: 4, isSample: true },
      ]),
    ).toBeNull();
  });

  it("counts only real reviews", () => {
    expect(
      aggregateRating([
        { rating: 5, isSample: true },
        { rating: 4, isSample: false },
        { rating: 3, isSample: false },
      ]),
    ).toEqual({ ratingValue: 3.5, reviewCount: 2 });
  });
});
