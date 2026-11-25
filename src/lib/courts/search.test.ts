import { describe, expect, it } from "vitest";
import { matchesCountyQuery } from "./search";
import type { CountySummary } from "./types";

const county: CountySummary = {
  slug: "san-bernardino-county",
  name: "San Bernardino",
  seatCity: "San Bernardino",
  popularRank: 5,
  courthouses: [
    { name: "Fontana Courthouse", city: "Fontana", courtCode: "SBD-02" },
    {
      name: "Rancho Cucamonga Courthouse",
      city: "Rancho Cucamonga",
      courtCode: "SBD-03",
    },
  ],
};

const mendocino: CountySummary = {
  slug: "mendocino-county",
  name: "Mendocino",
  seatCity: "Ukiah",
  popularRank: null,
  courthouses: [{ name: "Ukiah Courthouse", city: "Ukiah", courtCode: null }],
};

describe("matchesCountyQuery", () => {
  it("matches an empty query", () => {
    expect(matchesCountyQuery(county, "")).toBe(true);
    expect(matchesCountyQuery(county, "   ")).toBe(true);
  });

  it("matches by County name, even in the middle of it", () => {
    expect(matchesCountyQuery(county, "bernard")).toBe(true);
    expect(matchesCountyQuery(county, "orange")).toBe(false);
  });

  it("matches by county-seat city", () => {
    expect(matchesCountyQuery(mendocino, "ukiah")).toBe(true);
  });

  it("matches by Courthouse name", () => {
    expect(matchesCountyQuery(county, "cucamonga")).toBe(true);
  });

  it("matches by court code", () => {
    expect(matchesCountyQuery(county, "sbd-03")).toBe(true);
    expect(matchesCountyQuery(county, "sbd-09")).toBe(false);
  });

  it("ignores case and accents", () => {
    expect(matchesCountyQuery(county, "FONTANA")).toBe(true);
    expect(matchesCountyQuery(county, "Bérnardino")).toBe(true);
  });
});
