import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

async function answer(page: Page, answers: ("Yes" | "No")[]) {
  const groups = page.getByRole("group");
  for (const [index, value] of answers.entries()) {
    await groups.nth(index).getByLabel(value, { exact: true }).check();
  }
}

test("all yes shows the likely-eligible result with an enroll link", async ({
  page,
}) => {
  await page.goto("/eligibility");
  await answer(page, ["Yes", "Yes", "Yes", "Yes", "Yes"]);
  await page.getByRole("button", { name: "Check my result" }).click();
  const result = page.getByRole("status");
  await expect(result).toContainText("You're likely eligible");
  await result.getByRole("link", { name: "Choose your course" }).click();
  await expect(page).toHaveURL(/\/courses$/);
});

test("a no names the blocking answer and the next step", async ({ page }) => {
  await page.goto("/eligibility");
  await answer(page, ["Yes", "No", "Yes", "Yes", "Yes"]);
  await page.getByRole("button", { name: "Check my result" }).click();
  const result = page.getByRole("status");
  await expect(result).toContainText("Ask your court first");
  await expect(result).toContainText("allowed you to attend traffic school");
  await expect(
    result.getByRole("link", { name: "Find your court" }),
  ).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});

test("works in Spanish", async ({ page }) => {
  await page.goto("/es/eligibility");
  await answer(page, ["No", "Yes", "Yes", "Yes", "Yes"]);
  await page.getByRole("button", { name: "Ver mi resultado" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Probablemente la escuela de tránsito no es una opción",
  );
});
