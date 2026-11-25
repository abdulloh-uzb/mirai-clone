import { describe, expect, it } from "vitest";
import { breadcrumbList } from "./json-ld";

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
