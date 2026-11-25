import { expect, test } from "@playwright/test";

test("at 375 px the FAQ search works and the page does not scroll sideways", async ({
  page,
}) => {
  await page.goto("/faq");
  await page
    .getByRole("searchbox", { name: "Search the questions" })
    .fill("certificate");

  const visible = page.locator("details[data-faq-item]:not([hidden])");
  await expect(visible.first()).toContainText("certificate");
  expect(await visible.count()).toBeLessThan(36);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
