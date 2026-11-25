import { expect, test } from "@playwright/test";

test("an unbuilt nav link lands on the 404 page inside the page frame", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: "Courses" })
    .click();

  await expect(page).toHaveURL(/\/courses$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "This page took a wrong turn",
    }),
  ).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("the 404 page responds with status 404 and offers four routes and a way home", async ({
  page,
}) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);

  const main = page.getByRole("main");
  for (const name of [
    "Courses",
    "Find your court",
    "DMV services",
    "Questions and answers",
  ]) {
    await expect(main.getByRole("link", { name })).toBeVisible();
  }

  await main.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Traffic school, without the traffic",
  );
});

const localized404 = [
  {
    path: "/ja/no-such-page",
    lang: "ja",
    title: "このページは道を間違えたようです",
    home: "ホームに戻る",
  },
  {
    path: "/es/no-such-page",
    lang: "es",
    title: "Esta página tomó un giro equivocado",
    home: "Volver al inicio",
  },
  {
    path: "/ru/no-such-page",
    lang: "ru",
    title: "Эта страница свернула не туда",
    home: "На главную",
  },
] as const;

for (const item of localized404) {
  test(`the 404 page is shown in ${item.lang}`, async ({ page }) => {
    await page.goto(item.path);

    await expect(page.locator("html")).toHaveAttribute("lang", item.lang);
    await expect(
      page.getByRole("heading", { level: 1, name: item.title }),
    ).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: item.home }).click();
    await expect(page).toHaveURL(new RegExp(`/${item.lang}$`));
  });
}
