import { expect, test, type BrowserContext } from "@playwright/test";

async function savePreference(context: BrowserContext, locale: string) {
  await context.addCookies([
    { name: "ui_locale", value: locale, url: "http://localhost" },
  ]);
}

test("a deep unprefixed path stays English with a saved ru preference", async ({
  page,
  context,
}) => {
  await savePreference(context, "ru");

  const response = await page.goto("/faq");

  expect(new URL(page.url()).pathname).toBe("/faq");
  expect(response?.request().redirectedFrom()).toBeNull();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("the bare root goes to the saved ru preference", async ({
  page,
  context,
}) => {
  await savePreference(context, "ru");

  await page.goto("/");

  await expect(page).toHaveURL(/\/ru$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("the switcher keeps the current path and remembers the choice", async ({
  page,
  context,
}) => {
  await page.goto("/faq");

  await page.getByRole("button", { name: /^(EN|JA|ES|RU)\b/ }).click();
  await page.getByRole("link", { name: "日本語" }).click();

  await expect(page).toHaveURL(/\/ja\/faq$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "ui_locale")?.value).toBe("ja");

  await page.goto("/");
  await expect(page).toHaveURL(/\/ja$/);
});

test("switching back to English from a prefixed page drops the prefix", async ({
  page,
}) => {
  await page.goto("/es/faq");

  await page.getByRole("button", { name: /^(EN|JA|ES|RU)\b/ }).click();
  await page.getByRole("link", { name: "English", exact: true }).click();

  await expect(page).toHaveURL(/localhost:\d+\/faq$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
