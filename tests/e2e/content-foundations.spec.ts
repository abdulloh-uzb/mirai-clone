import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

test.describe("language suggestion for a Russian browser", () => {
  test.use({ locale: "ru-RU" });

  test("offers the same page in Russian without redirecting, and stays hidden once dismissed", async ({
    page,
  }) => {
    await page.goto("/faq");
    await expect(page).toHaveURL(/\/faq$/);
    const banner = page.getByRole("region", { name: "Language suggestion" });
    const link = banner.getByRole("link", {
      name: /Открыть эту страницу на русском/,
    });
    await expect(link).toHaveAttribute("href", "/ru/faq");

    await banner
      .getByRole("button", { name: "Hide language suggestion" })
      .click();
    await expect(banner).toBeHidden();

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Language suggestion" }),
    ).toBeHidden();
  });

  test("is not shown on a page already in Russian", async ({ page }) => {
    await page.goto("/ru");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Предложение языка" }),
    ).toHaveCount(0);
  });
});

test("an English browser sees no suggestion on an English page", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Language suggestion" }),
  ).toHaveCount(0);
});

test("pages are noindex by default and carry canonical and hreflang links", async ({
  page,
}) => {
  await page.goto("/es");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/es$/,
  );
  for (const lang of ["en", "ja", "es", "ru", "x-default"]) {
    await expect(
      page.locator(`link[rel="alternate"][hreflang="${lang}"]`),
    ).toHaveCount(1);
  }
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/placeholder\/og-default\.png$/,
  );
});

test("robots.txt disallows everything by default", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  expect(body).toMatch(/Disallow: \/\s*$/m);
});

test("sitemap.xml lists the home page in every language", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);
  const body = await response.text();
  for (const path of ["/", "/ja", "/es", "/ru"]) {
    expect(body).toMatch(new RegExp(`<loc>https?://[^<]+?${path}</loc>`));
  }
  expect(body).toContain('hreflang="x-default"');
});

test("the home page has no serious accessibility issues", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});
