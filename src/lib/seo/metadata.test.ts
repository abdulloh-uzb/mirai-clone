import { describe, expect, it } from "vitest";
import { buildPageMetadata, localizedUrl } from "./metadata";

const siteUrl = "https://example.test";

describe("localizedUrl", () => {
  it("has no prefix for English and a prefix for other languages", () => {
    expect(localizedUrl(siteUrl, "en", "/faq")).toBe(
      "https://example.test/faq",
    );
    expect(localizedUrl(siteUrl, "ja", "/faq")).toBe(
      "https://example.test/ja/faq",
    );
  });

  it("gives the bare language root for the home page", () => {
    expect(localizedUrl(siteUrl, "en", "/")).toBe("https://example.test/");
    expect(localizedUrl(`${siteUrl}/`, "ru", "/")).toBe(
      "https://example.test/ru",
    );
  });
});

describe("buildPageMetadata", () => {
  const base = {
    siteUrl,
    path: "/faq",
    title: "FAQ",
    description: "Answers",
    indexable: false,
  };

  it("points the canonical at the page itself and lists every language", () => {
    const metadata = buildPageMetadata({ ...base, locale: "es" });
    expect(metadata.alternates?.canonical).toBe("https://example.test/es/faq");
    expect(metadata.alternates?.languages).toEqual({
      en: "https://example.test/faq",
      ja: "https://example.test/ja/faq",
      es: "https://example.test/es/faq",
      ru: "https://example.test/ru/faq",
      "x-default": "https://example.test/faq",
    });
  });

  it("lists only the languages that have a version, plus x-default", () => {
    const metadata = buildPageMetadata({
      ...base,
      locale: "en",
      availableLocales: ["en", "ru"],
    });
    expect(Object.keys(metadata.alternates?.languages ?? {})).toEqual([
      "en",
      "ru",
      "x-default",
    ]);
  });

  it("points a fallback page's canonical at the English page", () => {
    const metadata = buildPageMetadata({
      ...base,
      locale: "ja",
      availableLocales: ["en"],
      isFallback: true,
    });
    expect(metadata.alternates?.canonical).toBe("https://example.test/faq");
  });

  it("is noindex unless indexing is allowed", () => {
    expect(buildPageMetadata({ ...base, locale: "en" }).robots).toEqual({
      index: false,
      follow: false,
    });
    expect(
      buildPageMetadata({ ...base, locale: "en", indexable: true }).robots,
    ).toEqual({ index: true, follow: true });
  });

  it("uses the default share image, made absolute", () => {
    const metadata = buildPageMetadata({ ...base, locale: "en" });
    expect(metadata.twitter).toMatchObject({
      images: ["https://example.test/placeholder/og-default.png"],
    });
  });
});
