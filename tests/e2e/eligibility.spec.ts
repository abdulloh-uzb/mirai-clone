import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";

/** Answers the questions one by one; each answer moves on to the next. */
async function answer(page: Page, answers: string[]) {
  const check = page.locator("#eligibility-check");
  for (const value of answers) {
    await check
      .getByRole("group")
      .getByRole("button", { name: value, exact: true })
      .click();
  }
}

test("all yes shows the likely-eligible result with an enroll link", async ({
  page,
}) => {
  await page.goto("/eligibility");
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await answer(page, ["Yes", "Yes", "Yes", "Yes", "Yes"]);
  const result = page.getByRole("status");
  await expect(result).toContainText("traffic school looks like an option");
  await expect(
    page.getByRole("heading", { level: 2, name: "You're likely eligible" }),
  ).toBeVisible();
  await result.getByRole("link", { name: "Choose your course" }).click();
  await expect(page).toHaveURL(/\/courses$/);
});

test("a no names the blocking answer and the next step", async ({ page }) => {
  await page.goto("/eligibility");
  await answer(page, ["Yes", "No", "Yes", "Yes", "Yes"]);
  const result = page.getByRole("status");
  await expect(
    page.getByRole("heading", { level: 2, name: "Ask your court first" }),
  ).toBeVisible();
  await expect(result).toContainText("allowed you to attend traffic school");
  await expect(
    result.getByRole("link", { name: "Find your court" }),
  ).toBeVisible();
  await expectNoSeriousA11yIssues(page);
});

test("back and why we ask work, and start over resets the check", async ({
  page,
}) => {
  await page.goto("/eligibility");
  const check = page.locator("#eligibility-check");
  await check.getByRole("button", { name: "Why we ask" }).click();
  await expect(check.locator(".el-why-panel")).toBeVisible();
  await answer(page, ["Yes"]);
  await expect(page.getByText("Question 2 of 5")).toBeVisible();
  await check.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
  await answer(page, ["Yes", "Yes", "Yes", "Yes", "Yes"]);
  await check.getByRole("button", { name: "Start over" }).click();
  await expect(page.getByText("Question 1 of 5")).toBeVisible();
});

test("works in Spanish", async ({ page }) => {
  await page.goto("/es/eligibility");
  await answer(page, ["No", "Sí", "Sí", "Sí", "Sí"]);
  await expect(page.getByRole("status")).toContainText(
    "requiere una licencia de conducir válida",
  );
});
