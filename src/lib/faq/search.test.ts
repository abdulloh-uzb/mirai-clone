import { describe, expect, it } from "vitest";
import { faqSearchText, matchesFaqQuery } from "./search";

const entry = {
  title: "How do I reset my password?",
  body: "Choose **Forgot password** on the [sign-in page](/login).\n\n- Check your *spam* folder",
};

describe("faqSearchText + matchesFaqQuery", () => {
  const text = faqSearchText(entry);

  it("matches on the title", () => {
    expect(matchesFaqQuery(text, "reset")).toBe(true);
  });

  it("matches on the body", () => {
    expect(matchesFaqQuery(text, "spam folder")).toBe(true);
  });

  it("ignores Markdown syntax and link targets", () => {
    expect(text).not.toContain("**");
    expect(text).not.toContain("/login");
    expect(matchesFaqQuery(text, "forgot password")).toBe(true);
  });

  it("ignores case and accents", () => {
    expect(matchesFaqQuery(text, "PASSWORD")).toBe(true);
    const es = faqSearchText({ title: "¿Cómo pago?", body: "Con tarjeta." });
    expect(matchesFaqQuery(es, "como")).toBe(true);
    expect(matchesFaqQuery(es, "CÓMO")).toBe(true);
  });

  it("requires every word of the query", () => {
    expect(matchesFaqQuery(text, "password spam")).toBe(true);
    expect(matchesFaqQuery(text, "password refund")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesFaqQuery(text, "")).toBe(true);
    expect(matchesFaqQuery(text, "   ")).toBe(true);
  });
});
