import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Fails on any critical or serious WCAG 2.1 A/AA issue on the current page. */
export async function expectNoSeriousA11yIssues(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = results.violations
    .filter((v) => v.impact === "critical" || v.impact === "serious")
    .map(
      (v) =>
        `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).join(", ")})`,
    );
  expect(serious).toEqual([]);
}
