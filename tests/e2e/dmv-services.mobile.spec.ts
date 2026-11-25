import { expect, test } from "@playwright/test";

test("at 375 px the DMV search works and the page does not scroll sideways", async ({
  page,
}) => {
  await page.goto("/dmv-services");
  await page
    .getByRole("searchbox", { name: "Search DMV services" })
    .fill("renew");

  const visible = page.locator("[data-tile]:not([hidden])");
  expect(await visible.count()).toBeGreaterThan(0);
  await expect(visible.first()).toContainText(/renew/i);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
