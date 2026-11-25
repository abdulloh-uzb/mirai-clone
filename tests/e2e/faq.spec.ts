import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

const cases = [
  {
    path: "/faq",
    h1: "Find an answer",
    count: "36 answers in 10 categories",
    search: "Search the questions",
  },
  {
    path: "/ja/faq",
    h1: "答えを見つける",
    count: "10カテゴリに36件の回答",
    search: "質問を検索",
  },
] as const;

for (const c of cases) {
  test(`${c.path} shows the heading and count line, and is accessible`, async ({
    page,
  }) => {
    await page.goto(c.path);
    await expect(
      page.getByRole("heading", { level: 1, name: c.h1 }),
    ).toBeVisible();
    await expect(page.getByText(c.count)).toBeVisible();
    await expect(page.getByRole("searchbox", { name: c.search })).toBeVisible();
    await expect(page.locator("details[data-faq-item]")).toHaveCount(36);
    await expectNoSeriousA11yIssues(page);
  });
}

test("typing a word filters the questions", async ({ page }) => {
  await page.goto("/faq");
  await page
    .getByRole("searchbox", { name: "Search the questions" })
    .fill("password");
  const visible = page.locator("details[data-faq-item]:not([hidden])");
  await expect(visible).toHaveCount(1);
  await expect(visible.first()).toContainText("How do I reset my password?");
  await expect(page.getByText("1 answer found")).toBeVisible();
});

test("a search with no match says so", async ({ page }) => {
  await page.goto("/faq");
  await page
    .getByRole("searchbox", { name: "Search the questions" })
    .fill("zzzzqq");
  await expect(page.getByText("No answers match your search")).toBeVisible();
});

test("the Refund shortcut filters the questions", async ({ page }) => {
  await page.goto("/faq");
  await page
    .getByRole("group", { name: "Popular searches" })
    .getByRole("button", { name: "Refund" })
    .click();
  await expect(
    page.getByRole("searchbox", { name: "Search the questions" }),
  ).toHaveValue("refund");
  const visible = page.locator("details[data-faq-item]:not([hidden])");
  await expect(visible.first()).toContainText("What is the refund policy?");
  expect(await visible.count()).toBeLessThan(10);
});

test("a #slug link opens that question", async ({ page }) => {
  await page.goto("/faq#how-long-do-i-have");
  const item = page.locator("details#how-long-do-i-have");
  await expect(item).toHaveAttribute("open", "");
  await expect(item).toContainText("90 days of access");
  await expect(item).toBeInViewport();
});

test("a #slug link opens the question in another language", async ({
  page,
}) => {
  await page.goto("/ja/faq#what-is-the-refund-policy");
  await expect(
    page.locator("details#what-is-the-refund-policy"),
  ).toHaveAttribute("open", "");
});

test("FAQPage structured data lists every question", async ({ page }) => {
  await page.goto("/faq");
  const json = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const faq = json
    .map(
      (text) => JSON.parse(text) as { "@type": string; mainEntity?: unknown[] },
    )
    .find((data) => data["@type"] === "FAQPage");
  expect(faq?.mainEntity).toHaveLength(36);
});
