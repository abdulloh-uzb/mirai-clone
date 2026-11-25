import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

test("lists entries newest first with dates and anchors", async ({ page }) => {
  await page.goto("/whats-new");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What's new",
  );
  const entries = page.locator("article[id]");
  await expect(entries).toHaveCount(4);
  await expect(entries.first()).toHaveAttribute("id", "public-site-opens");
  const dates = await entries
    .locator("time")
    .evaluateAll((times) => times.map((t) => t.getAttribute("datetime") ?? ""));
  expect([...dates].sort().reverse()).toEqual(dates);
  await expect(page.locator("#courts-by-county h2 a")).toHaveAttribute(
    "href",
    "#courts-by-county",
  );
  await expectNoSeriousA11yIssues(page);
});

test("renders in Japanese", async ({ page }) => {
  await page.goto("/ja/whats-new");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("新着情報");
  await expect(page.locator("article[id]")).toHaveCount(4);
});
