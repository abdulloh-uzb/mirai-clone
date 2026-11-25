import { afterAll, describe, expect, it } from "vitest";
import { serviceClient, visitor } from "../support/users";

const PAGE_SLUGS = [
  "about",
  "accessibility",
  "privacy",
  "refund-policy",
  "school-rules",
  "terms",
];
const tag = `pages-test-${Date.now()}`;

afterAll(async () => {
  await serviceClient.from("pages").delete().like("slug", `${tag}%`);
  await serviceClient.from("changelog").delete().like("slug", `${tag}%`);
});

describe("content pages", () => {
  it("lets a Visitor read the 6 published pages in English", async () => {
    const { data, error } = await visitor()
      .from("pages")
      .select("slug")
      .eq("locale", "en")
      .in("slug", PAGE_SLUGS);
    expect(error).toBeNull();
    expect(data?.map((row) => row.slug).sort()).toEqual(PAGE_SLUGS);
  });

  it("leaves school-rules without a Russian row, for the fallback", async () => {
    const { data } = await visitor()
      .from("pages")
      .select("locale")
      .eq("slug", "school-rules");
    expect(data?.map((row) => row.locale).sort()).toEqual(["en", "es", "ja"]);
  });

  it("hides an unpublished page from a Visitor", async () => {
    const { error } = await serviceClient.from("pages").insert({
      locale: "en",
      slug: `${tag}-draft`,
      title: "Draft",
      body: "",
      published: false,
    });
    if (error) throw error;
    const { data } = await visitor()
      .from("pages")
      .select("slug")
      .eq("slug", `${tag}-draft`);
    expect(data).toEqual([]);
  });
});

describe("changelog", () => {
  it("lets a Visitor read 4 published entries per language", async () => {
    for (const locale of ["en", "ja", "es", "ru"]) {
      const { data } = await visitor()
        .from("changelog")
        .select("slug")
        .eq("locale", locale);
      expect(data, locale).toHaveLength(4);
    }
  });

  it("hides an unpublished entry from a Visitor", async () => {
    const { error } = await serviceClient.from("changelog").insert({
      locale: "en",
      slug: `${tag}-draft`,
      title: "Draft",
      published: false,
    });
    if (error) throw error;
    const { data } = await visitor()
      .from("changelog")
      .select("slug")
      .eq("slug", `${tag}-draft`);
    expect(data).toEqual([]);
  });
});
