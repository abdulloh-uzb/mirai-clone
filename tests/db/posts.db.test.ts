import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { serviceClient, visitor } from "../support/users";

describe("Blog posts", () => {
  it("lets a Visitor read the 6 seeded English posts with categories", async () => {
    const { data, error } = await visitor()
      .from("posts")
      .select("slug, category, published_at")
      .eq("locale", "en")
      .order("published_at", { ascending: false });

    expect(error).toBeNull();
    expect(data).toHaveLength(6);
    const counts: Record<string, number> = {};
    for (const post of data ?? []) {
      counts[post.category] = (counts[post.category] ?? 0) + 1;
    }
    expect(counts).toEqual({
      "traffic-school": 2,
      "california-driving": 2,
      "after-your-ticket": 2,
    });
  });

  it("hides an unpublished post from a Visitor", async () => {
    const slug = `draft-${randomUUID()}`;
    const { error: insertError } = await serviceClient.from("posts").insert({
      locale: "en",
      slug,
      title: "Draft",
      category: "traffic-school",
      published: false,
    });
    expect(insertError).toBeNull();

    const { data } = await visitor()
      .from("posts")
      .select("slug")
      .eq("slug", slug);
    expect(data).toEqual([]);
    await serviceClient.from("posts").delete().eq("slug", slug);
  });

  it("rejects an unknown category", async () => {
    const { error } = await serviceClient.from("posts").insert({
      locale: "en",
      slug: `bad-${randomUUID()}`,
      title: "Bad",
      category: "cooking",
    });
    expect(error).not.toBeNull();
  });
});
