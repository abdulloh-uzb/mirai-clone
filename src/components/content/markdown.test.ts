import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

function render(source: string): string {
  return renderToStaticMarkup(createElement(Markdown, null, source));
}

describe("Markdown", () => {
  it("renders headings, lists and links", () => {
    const html = render("## Rules\n\n- One\n- Two\n\n[FAQ](/faq)");
    expect(html).toContain("<h2");
    expect(html).toContain("<li>One</li>");
    expect(html).toContain('href="/faq"');
  });

  it("drops raw HTML, including scripts and event handlers", () => {
    const html = render(
      'Hi <script>alert(1)</script> <img src=x onerror="alert(2)"> there\n\n<div onclick="x()">block</div>',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("<div onclick");
  });

  it("drops javascript: links", () => {
    const html = render("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("opens external links safely and keeps internal links in the tab", () => {
    const html = render("[DMV](https://www.dmv.ca.gov/) [FAQ](/faq)");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html.match(/target="_blank"/g)).toHaveLength(1);
  });
});
