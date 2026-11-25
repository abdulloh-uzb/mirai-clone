import { describe, expect, it } from "vitest";
import { breadcrumbList, course, faqPage } from "./json-ld";

describe("faqPage", () => {
  it("lists each question with its accepted answer", () => {
    expect(
      faqPage([
        { question: "Q1?", answer: "A1" },
        { question: "Q2?", answer: "A2" },
      ]),
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Q1?",
          acceptedAnswer: { "@type": "Answer", text: "A1" },
        },
        {
          "@type": "Question",
          name: "Q2?",
          acceptedAnswer: { "@type": "Answer", text: "A2" },
        },
      ],
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

describe("course", () => {
  it("builds a Course whose offer price comes from the cents given", () => {
    const data = course({
      siteUrl: "https://example.test",
      locale: "es",
      name: "TVC",
      description: "A course.",
      path: "/courses",
      priceCents: 2499,
      providerName: "School",
      languages: ["en", "es"],
    });

    expect(data).toMatchObject({
      "@type": "Course",
      url: "https://example.test/es/courses",
      inLanguage: ["en", "es"],
      provider: { name: "School" },
      offers: { price: "24.99", priceCurrency: "USD" },
    });
  });
});
