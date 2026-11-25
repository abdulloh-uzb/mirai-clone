import { expect, test } from "@playwright/test";

test.use({ colorScheme: "light" });

test("the theme choice survives a reload", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("switch", { name: "Dark theme" });
  await expect(toggle).toHaveAttribute("aria-checked", "false");

  await toggle.click();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);

  await page.reload();
  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  await toggle.click();
  await page.reload();
  await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
});

test("the skip link is the first stop and moves focus to the main content", async ({
  page,
}) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

test("keyboard focus is visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  const outline = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return "none";
    return getComputedStyle(el).outlineStyle;
  });
  expect(outline).not.toBe("none");
});
