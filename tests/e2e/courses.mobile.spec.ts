import { expect, test } from "@playwright/test";
import { useUniqueIp } from "../support/support-forms";

test.beforeEach(async ({ page }) => {
  await useUniqueIp(page);
});

test("language cards, eligibility and waitlist forms fit at 375 px", async ({
  page,
}) => {
  await page.goto("/courses");
  const cards = page.getByRole("navigation", { name: "Course languages" });
  await cards.getByRole("link", { name: /Español/ }).click();
  await expect(page).toHaveURL(/\?course=es$/);
  // The classroom form loads when it nears the viewport.
  await page.locator("#classroom").scrollIntoViewIfNeeded();
  await expect(page.locator("#classroom").getByLabel("County")).toBeVisible();
  await page.getByRole("button", { name: /Ticket from:/ }).click();
  await expect(page.getByLabel("Where is your ticket from?")).toBeVisible();

  await page.goto("/eligibility");
  await expect(page.getByRole("group")).toHaveCount(5);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
