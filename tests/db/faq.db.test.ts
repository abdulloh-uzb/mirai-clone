import { afterEach, describe, expect, it } from "vitest";
import { serviceClient, visitor } from "../support/users";

const LOCALES = ["en", "ja", "es", "ru"] as const;
const created: string[] = [];

afterEach(async () => {
  if (created.length) {
    await serviceClient.from("faq_items").delete().in("slug", created);
    created.length = 0;
  }
});

describe("FAQ items", () => {
  it("lets a Visitor read published items with a category, in every language", async () => {
    for (const locale of LOCALES) {
      const { data, error } = await visitor()
        .from("faq_items")
        .select("slug, category, featured, published")
        .eq("locale", locale);
      expect(error).toBeNull();
      expect(data?.length, locale).toBeGreaterThanOrEqual(34);
      expect(data?.every((r) => r.published && r.category)).toBe(true);
      const categories = new Set(data?.map((r) => r.category));
      expect(categories.size, locale).toBe(10);
    }
  });

  it("features exactly 4 items per language, the same in each", async () => {
    const slugsByLocale: string[][] = [];
    for (const locale of LOCALES) {
      const { data } = await visitor()
        .from("faq_items")
        .select("slug")
        .eq("locale", locale)
        .eq("featured", true);
      expect(data, locale).toHaveLength(4);
      slugsByLocale.push((data ?? []).map((r) => r.slug).sort());
    }
    for (const slugs of slugsByLocale) expect(slugs).toEqual(slugsByLocale[0]);
  });

  it("keeps unpublished items invisible to a Visitor", async () => {
    created.push("test-unpublished");
    const { error } = await serviceClient.from("faq_items").insert({
      locale: "en",
      slug: "test-unpublished",
      title: "Hidden",
      category: "about",
      published: false,
    });
    expect(error).toBeNull();

    const { data } = await visitor()
      .from("faq_items")
      .select("slug")
      .eq("slug", "test-unpublished");
    expect(data).toEqual([]);
  });

  it("rejects an unknown category", async () => {
    created.push("test-bad-category");
    const { error } = await serviceClient.from("faq_items").insert({
      locale: "en",
      slug: "test-bad-category",
      title: "Bad",
      category: "nonsense",
    });
    expect(error).not.toBeNull();
  });
});
