import { describe, expect, it } from "vitest";
import { buildSitemap } from "./sitemap";
import { staticSitemapPages } from "./sitemap-pages";

describe("sitemap pages", () => {
  it("lists the courts page", () => {
    expect(staticSitemapPages.map((p) => p.path)).toContain("/courts");
  });
});

describe("buildSitemap", () => {
  it("lists a page once per language with alternates", () => {
    const entries = buildSitemap("https://example.test", [{ path: "/faq" }]);
    expect(entries.map((e) => e.url)).toEqual([
      "https://example.test/faq",
      "https://example.test/ja/faq",
      "https://example.test/es/faq",
      "https://example.test/ru/faq",
    ]);
    expect(entries[1]?.alternates?.languages).toMatchObject({
      ru: "https://example.test/ru/faq",
      "x-default": "https://example.test/faq",
    });
  });

  it("lists only the languages a page exists in", () => {
    const entries = buildSitemap("https://example.test", [
      { path: "/blog/x", locales: ["en", "es"] },
    ]);
    expect(entries.map((e) => e.url)).toEqual([
      "https://example.test/blog/x",
      "https://example.test/es/blog/x",
    ]);
  });
});
