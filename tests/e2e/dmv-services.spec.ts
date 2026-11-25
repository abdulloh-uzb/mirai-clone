import { expect, test } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

const cases = [
  {
    path: "/dmv-services",
    h1: "California DMV services",
    search: "Search DMV services",
    query: "REAL ID",
    newTab: "(opens in a new tab)",
    notice: /not affiliated with or endorsed by the California DMV/,
  },
  {
    path: "/ru/dmv-services",
    h1: "Услуги DMV Калифорнии",
    search: "Поиск услуг DMV",
    query: "аэропорт",
    newTab: "(откроется в новой вкладке)",
    notice: /не связан с DMV Калифорнии/,
  },
] as const;

for (const c of cases) {
  test(`${c.path} shows the notice before the tiles, filters, and is accessible`, async ({
    page,
  }) => {
    await page.goto(c.path);
    await expect(
      page.getByRole("heading", { level: 1, name: c.h1 }),
    ).toBeVisible();

    const note = page.getByRole("note");
    await expect(note).toContainText(c.notice);
    const noteBox = await note.boundingBox();
    const firstTile = await page.locator("[data-tile]").first().boundingBox();
    expect(noteBox!.y).toBeLessThan(firstTile!.y);

    const tiles = page.locator("[data-tile]:not([hidden])");
    const total = await tiles.count();
    expect(total).toBeGreaterThanOrEqual(18);

    const links = page.locator("[data-tile] a");
    const first = links.first();
    await expect(first).toHaveAttribute("target", "_blank");
    await expect(first).toHaveAttribute("rel", /noopener/);
    await expect(first).toHaveAccessibleName(
      new RegExp(c.newTab.replace(/[()]/g, "\\$&")),
    );
    await expect(first).toHaveAttribute(
      "href",
      /^https:\/\/www\.dmv\.ca\.gov\//,
    );

    await page.getByRole("searchbox", { name: c.search }).fill(c.query);
    const visible = await tiles.count();
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThan(total);

    await page.getByRole("searchbox", { name: c.search }).fill("zzzzqq");
    await expect(tiles).toHaveCount(0);
    await expect(page.locator("[data-group]:not([hidden])")).toHaveCount(0);

    await page.getByRole("searchbox", { name: c.search }).fill("");
    await expect(tiles).toHaveCount(total);
    await expectNoSeriousA11yIssues(page);
  });
}
