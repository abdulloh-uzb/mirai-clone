import { expect, test } from "@playwright/test";

test("at 375 px the nav sits behind a hamburger menu", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Courses" })).toBeHidden();

  // The page must fit the narrow screen without sideways scrolling.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);

  await header.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  for (const name of [
    "Courses",
    "DMV Services",
    "Courts",
    "About",
    "FAQs",
    "Blog",
    "Contact",
  ]) {
    await expect(menu.getByRole("link", { name })).toBeVisible();
  }

  await menu.getByRole("link", { name: "FAQs" }).click();
  await expect(page).toHaveURL(/\/faq$/);
  await expect(menu).toBeHidden();
});

test("the mobile menu closes with its close button", async ({ page }) => {
  await page.goto("/ru");
  await page.getByRole("button", { name: "Открыть меню" }).click();
  const menu = page.getByRole("dialog", { name: "Меню" });
  await expect(menu).toBeVisible();

  await menu.getByRole("button", { name: "Закрыть меню" }).click();
  await expect(menu).toBeHidden();
});
