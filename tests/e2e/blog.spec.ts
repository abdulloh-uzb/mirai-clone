import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

const FALLBACK_SLUG = "driving-in-rain-and-fog";

async function jsonLdTypes(page: Page): Promise<string[]> {
  const blocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return blocks.map(
    (text) => (JSON.parse(text) as { "@type": string })["@type"],
  );
}

test("/blog lists the 6 posts newest first and is accessible", async ({
  page,
}) => {
  await page.goto("/blog");
  await expect(
    page.getByRole("heading", { level: 1, name: "Blog" }),
  ).toBeVisible();

  const titles = page
    .getByRole("list", { name: "Blog posts" })
    .getByRole("heading", { level: 2 });
  await expect(titles).toHaveCount(6);
  await expect(titles.first()).toHaveText(
    "What traffic school is and how it works",
  );
  await expect(titles.last()).toHaveText("Keeping your driving record clean");
  await expectNoSeriousA11yIssues(page);
});

test("the category filter narrows the list and marks the current category", async ({
  page,
}) => {
  await page.goto("/blog?category=california-driving");
  const filter = page.getByRole("navigation", { name: "Filter by category" });
  await expect(
    filter.getByRole("link", { name: "California driving" }),
  ).toHaveAttribute("aria-current", "true");
  await expect(
    page
      .getByRole("list", { name: "Blog posts" })
      .getByRole("heading", { level: 2 }),
  ).toHaveCount(2);

  await filter.getByRole("link", { name: "All" }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(
    page
      .getByRole("list", { name: "Blog posts" })
      .getByRole("heading", { level: 2 }),
  ).toHaveCount(6);
});

test("an unknown category shows every post", async ({ page }) => {
  await page.goto("/blog?category=nope");
  await expect(
    page
      .getByRole("list", { name: "Blog posts" })
      .getByRole("heading", { level: 2 }),
  ).toHaveCount(6);
});

test("a post in English shows category, date, body, related posts and JSON-LD", async ({
  page,
}) => {
  await page.goto("/blog/what-is-traffic-school");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "What traffic school is and how it works",
    }),
  ).toBeVisible();
  await expect(page.locator("article time").first()).toHaveText(
    "November 12, 2026",
  );
  await expect(
    page.locator("article").getByRole("link", { name: "Traffic school" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Who can take it" }),
  ).toBeVisible();

  const related = page.getByRole("region", { name: "Related posts" });
  await expect(related.getByRole("listitem")).toHaveCount(1);
  expect(await jsonLdTypes(page)).toEqual(["Article", "BreadcrumbList"]);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/blog\/what-is-traffic-school$/,
  );
  await expectNoSeriousA11yIssues(page);
});

test("a post in Spanish is shown in Spanish with its own canonical", async ({
  page,
}) => {
  await page.goto("/es/blog/what-is-traffic-school");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Qué es la escuela de tráfico y cómo funciona",
    }),
  ).toBeVisible();
  await expect(page.getByRole("note")).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    /\/es\/blog\/what-is-traffic-school$/,
  );
  expect(await jsonLdTypes(page)).toEqual(["Article", "BreadcrumbList"]);
});

test("an English-only post under /ru shows the notice, English canonical and no ru hreflang", async ({
  page,
}) => {
  await page.goto(`/ru/blog/${FALLBACK_SLUG}`);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Driving safely in rain and fog",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("note").filter({ hasText: "isn't translated" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    new RegExp(`/blog/${FALLBACK_SLUG}$`),
  );
  expect(
    await page.locator('link[rel="canonical"]').getAttribute("href"),
  ).not.toContain("/ru/");
  await expect(
    page.locator('link[rel="alternate"][hreflang="ru"]'),
  ).toHaveCount(0);
  await expect(
    page.locator('link[rel="alternate"][hreflang="en"]'),
  ).toHaveCount(1);
  await expectNoSeriousA11yIssues(page);
});

test("an unknown slug is a 404", async ({ page }) => {
  const response = await page.goto("/blog/does-not-exist");
  expect(response?.status()).toBe(404);
});

test("the sitemap lists the posts with their language alternates", async ({
  request,
}) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/blog</loc>");
  expect(xml).toContain("/blog/what-is-traffic-school</loc>");
  expect(xml).toContain("/ru/blog/what-is-traffic-school</loc>");
  expect(xml).toContain(`/blog/${FALLBACK_SLUG}</loc>`);
  expect(xml).not.toContain(`/ru/blog/${FALLBACK_SLUG}</loc>`);
});
