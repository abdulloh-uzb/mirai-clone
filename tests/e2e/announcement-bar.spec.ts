import { expect, test } from "@playwright/test";
import { serviceClient } from "../support/supabase";

// Seeded by supabase/seed.sql.
const SEEDED_EN =
  "Welcome to the RoadReady demo. Courses open soon in four languages.";

test("the announcement bar shows, dismisses and stays dismissed", async ({
  page,
}) => {
  await page.goto("/");
  const bar = page.getByRole("region", { name: "Announcement" });
  await expect(bar).toContainText(SEEDED_EN);

  await bar.getByRole("button", { name: "Dismiss announcement" }).click();
  await expect(bar).toBeHidden();

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(bar).toBeHidden();
});

test("the bar uses the UI language's announcement", async ({ page }) => {
  await page.goto("/ru");

  await expect(page.getByRole("region", { name: "Объявление" })).toContainText(
    "Добро пожаловать в демо RoadReady",
  );
});

test("the bar is hidden when the UI language has no published announcement", async ({
  page,
}) => {
  const service = serviceClient();
  const { data: unpublished, error } = await service
    .from("announcements")
    .update({ published: false })
    .eq("locale", "ja")
    .eq("published", true)
    .select("id");
  if (error) throw error;

  try {
    await page.goto("/ja");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "お知らせ" })).toHaveCount(0);
  } finally {
    await service
      .from("announcements")
      .update({ published: true })
      .in(
        "id",
        unpublished.map((row) => row.id),
      );
  }
});
