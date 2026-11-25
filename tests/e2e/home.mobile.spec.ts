import { expect, test } from "@playwright/test";

test("the home page fits at 375 px and its CTAs work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);

  const carousel = page.getByRole("region", { name: "Student reviews" });
  await carousel.getByRole("button", { name: "Next review" }).click();
  await expect(carousel.getByText("2 / 6")).toBeVisible();

  await page.getByRole("link", { name: "Explore Courses" }).click();
  await expect(page).toHaveURL(/\/courses$/);
});
