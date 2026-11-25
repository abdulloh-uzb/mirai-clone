import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";
import { article, breadcrumbList } from "./json-ld";

describe("article", () => {
  it("describes a post with absolute urls and the school as publisher", () => {
    const data = article({
      siteUrl: "https://example.test",
      locale: "es",
      path: "/blog/hola",
      title: "Hola",
      description: "Resumen",
      image: "/placeholder/blog-traffic-school.svg",
      datePublished: "2026-06-18T09:00:00Z",
      dateModified: "2026-07-01T09:00:00Z",
    });
    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "Hola",
      description: "Resumen",
      image: "https://example.test/placeholder/blog-traffic-school.svg",
      datePublished: "2026-06-18T09:00:00Z",
      dateModified: "2026-07-01T09:00:00Z",
      inLanguage: "es",
      mainEntityOfPage: "https://example.test/es/blog/hola",
      publisher: { "@type": "Organization", name: siteConfig.name },
    });
  });
});

describe("breadcrumbList", () => {
  it("numbers the items from 1 and links them in the page's language", () => {
    const data = breadcrumbList("https://example.test", "ja", [
      { name: "Home", path: "/" },
      { name: "Courts", path: "/courts" },
      { name: "Los Angeles", path: "/courts/los-angeles-county" },
    ]);

    expect(data).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://example.test/ja",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Courts",
          item: "https://example.test/ja/courts",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Los Angeles",
          item: "https://example.test/ja/courts/los-angeles-county",
        },
      ],
    });
  });
});
