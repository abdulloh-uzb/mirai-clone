import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

const listCases = [
  {
    path: "/courts",
    h1: "Find your county court",
    popular: "Popular counties",
    all: "All counties",
    search: "Search by county, city, courthouse or court code",
  },
  {
    path: "/es/courts",
    h1: "Encuentre el tribunal de su condado",
    popular: "Condados populares",
    all: "Todos los condados",
    search: "Busque por condado, ciudad, juzgado o código del tribunal",
  },
] as const;

for (const c of listCases) {
  test(`${c.path} shows popular cards and all 58 counties, and is accessible`, async ({
    page,
  }) => {
    await page.goto(c.path);
    await expect(
      page.getByRole("heading", { level: 1, name: c.h1 }),
    ).toBeVisible();

    const popular = page.getByRole("group", { name: c.popular });
    await expect(popular.getByRole("link")).toHaveCount(4);
    await expect(popular.getByRole("link").first()).toContainText(
      "Los Angeles",
    );

    await expect(
      page.getByRole("list", { name: c.all }).getByRole("listitem"),
    ).toHaveCount(58);
    await expectNoSeriousA11yIssues(page);
  });
}

test("searching by a city narrows the list to that County", async ({
  page,
}) => {
  await page.goto("/courts");
  const rows = page
    .getByRole("list", { name: "All counties" })
    .getByRole("listitem");
  await page
    .getByRole("searchbox", {
      name: "Search by county, city, courthouse or court code",
    })
    .fill("redwood city");

  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("San Mateo");
  await expect(page.getByText("1 county found")).toBeVisible();
});

test("searching by a court code narrows the list to that County", async ({
  page,
}) => {
  await page.goto("/courts");
  const rows = page
    .getByRole("list", { name: "All counties" })
    .getByRole("listitem");
  await page
    .getByRole("searchbox", {
      name: "Search by county, city, courthouse or court code",
    })
    .fill("SBD-02");

  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("San Bernardino");
});

test("the list shows a court code and how many more courthouses a County has", async ({
  page,
}) => {
  await page.goto("/courts");
  const row = page
    .getByRole("list", { name: "All counties" })
    .getByRole("listitem")
    .filter({ hasText: "Los Angeles" })
    .first();
  await expect(row).toContainText("LA-01");
  await expect(row).toContainText("+3");
});

const countyCases = [
  {
    path: "/courts/los-angeles-county",
    locale: "en",
    h1: "Got a ticket in Los Angeles County?",
    notice: "Demo data — check with your court",
    cta: "Browse courses",
    courthouses: "Courthouses",
  },
  {
    path: "/ja/courts/los-angeles-county",
    locale: "ja",
    h1: "Los Angeles郡で違反切符を受け取りましたか？",
    notice: "デモデータです。必ず管轄の裁判所でご確認ください",
    cta: "講座を見る",
    courthouses: "裁判所の所在地",
  },
] as const;

for (const c of countyCases) {
  test(`${c.path} shows the demo notice, courthouses, CTA and breadcrumbs`, async ({
    page,
  }) => {
    await page.goto(c.path);
    await expect(
      page.getByRole("heading", { level: 1, name: c.h1 }),
    ).toBeVisible();
    await expect(page.getByRole("note")).toContainText(c.notice);
    await expect(
      page.getByRole("heading", { level: 2, name: c.courthouses }),
    ).toBeVisible();
    await expect(page.getByText("LA-01")).toBeVisible();
    await expect(page.getByRole("link", { name: c.cta })).toHaveAttribute(
      "href",
      c.locale === "en" ? "/courses" : `/${c.locale}/courses`,
    );
    // No official case-lookup URL is seeded, so no lookup link is shown.
    await expect(page.getByRole("link", { name: /case/i })).toHaveCount(0);

    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const data = JSON.parse(raw ?? "{}") as {
      "@type": string;
      itemListElement: { position: number; item: string }[];
    };
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(data.itemListElement[2]?.item).toMatch(
      /\/courts\/los-angeles-county$/,
    );

    await expectNoSeriousA11yIssues(page);
  });
}

test("clicking a County on the map fills the panel with a link to its court", async ({
  page,
}) => {
  await page.goto("/courts");
  const map = page.getByRole("group", { name: "Map of California counties" });
  await expect(map.getByRole("button")).toHaveCount(58);
  await map.getByRole("button", { name: "Fresno County" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Fresno" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "See court details" }),
  ).toHaveAttribute("href", "/courts/fresno-county");
  await page.getByRole("button", { name: "Pick another county" }).click();
  await expect(
    page.getByRole("heading", { level: 2, name: "Pick your county" }),
  ).toBeVisible();
});

test("the ticket plan takes a courthouse and a due date and shows the plan", async ({
  page,
}) => {
  await page.goto("/courts/los-angeles-county");
  const next = page.getByRole("button", { name: "Next", exact: true });
  await expect(next).toBeDisabled();
  await page.locator(".ct-row").first().click();
  await expect(next).toBeEnabled();
  await next.click();
  await page.getByLabel("Due date").fill("2099-01-15");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator(".ct-paper")).toContainText("2099-01-15");
  await expect(page.locator(".ct-paper")).toContainText("days left");
});

test("an unknown County is a 404", async ({ page }) => {
  const response = await page.goto("/courts/nowhere-county");
  expect(response?.status()).toBe(404);
});
