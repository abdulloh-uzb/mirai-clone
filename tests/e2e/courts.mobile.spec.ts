import { expect, test } from "@playwright/test";

test("at 375 px the court search works and the page does not scroll sideways", async ({
  page,
}) => {
  await page.goto("/courts");
  await page
    .getByRole("searchbox", {
      name: "Search by county, city, courthouse or court code",
    })
    .fill("fresno");

  const rows = page
    .getByRole("list", { name: "All counties" })
    .getByRole("listitem");
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Fresno");

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});
