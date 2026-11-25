import { describe, expect, it } from "vitest";
import { buildSitemap } from "@/lib/seo/sitemap";
import { toSitemapPages } from "./sitemap";

describe("toSitemapPages", () => {
  it("lists a post in the languages that have a row", () => {
    const pages = toSitemapPages([
      { slug: "a", locale: "en", updated_at: "2026-01-02T00:00:00Z" },
      { slug: "a", locale: "ja", updated_at: "2026-03-02T00:00:00Z" },
      { slug: "a", locale: "es", updated_at: "2026-01-02T00:00:00Z" },
      { slug: "b", locale: "en", updated_at: "2026-02-02T00:00:00Z" },
    ]);
    expect(pages).toEqual([
      {
        path: "/blog/a",
        locales: ["en", "ja", "es"],
        lastModified: new Date("2026-03-02T00:00:00Z"),
      },
      {
        path: "/blog/b",
        locales: ["en"],
        lastModified: new Date("2026-02-02T00:00:00Z"),
      },
    ]);
    const urls = buildSitemap("https://example.test", pages).map((e) => e.url);
    expect(urls).toHaveLength(4);
    expect(urls).not.toContain("https://example.test/ru/blog/a");
  });
});
