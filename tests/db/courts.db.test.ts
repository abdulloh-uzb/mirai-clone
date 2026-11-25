import { describe, expect, it } from "vitest";
import { visitor } from "../support/users";

describe("Counties and Courthouses", () => {
  it("lets a Visitor read all 58 California Counties, 14 of them popular", async () => {
    const { data, error } = await visitor()
      .from("counties")
      .select("name, slug, seat_city, popular_rank")
      .eq("state_code", "CA")
      .order("name");

    expect(error).toBeNull();
    expect(data).toHaveLength(58);
    expect(data?.every((c) => c.slug.endsWith("-county"))).toBe(true);
    const popular = (data ?? [])
      .filter((c) => c.popular_rank !== null)
      .sort((a, b) => (a.popular_rank ?? 0) - (b.popular_rank ?? 0));
    expect(popular).toHaveLength(14);
    expect(popular[0]?.name).toBe("Los Angeles");
    expect(popular[13]?.name).toBe("San Mateo");
    expect(data?.find((c) => c.name === "Sacramento")?.seat_city).toBe(
      "Sacramento",
    );
  });

  it("gives every County at least one Courthouse a Visitor can read", async () => {
    const { data, error } = await visitor()
      .from("counties")
      .select("slug, courts(name, court_code)");

    expect(error).toBeNull();
    expect(data).toHaveLength(58);
    for (const county of data ?? []) {
      expect(county.courts.length, county.slug).toBeGreaterThanOrEqual(1);
    }
  });

  it("does not let a Visitor add a County", async () => {
    const { error } = await visitor().from("counties").insert({
      state_code: "CA",
      name: "Nowhere",
      slug: "nowhere-county",
      seat_city: "Nowhere",
    });

    expect(error).not.toBeNull();
  });
});
