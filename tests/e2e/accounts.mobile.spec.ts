import { expect, test, type Page } from "@playwright/test";
import { createStudentAccount, deleteTestUsers } from "../support/users";

test.afterAll(deleteTestUsers);

const overflows = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

test("at 375 px a Visitor can reach sign-up from the header", async ({
  page,
}) => {
  await page.goto("/ru");
  expect(await overflows(page)).toBe(false);

  await page
    .getByRole("banner")
    .getByRole("link", { name: "Создать аккаунт" })
    .click();
  await expect(
    page.getByRole("heading", { level: 1, name: "Создайте аккаунт" }),
  ).toBeVisible();
});

test("at 375 px a signed-in Student's header fits and shows their initials", async ({
  page,
}) => {
  const student = await createStudentAccount({
    firstName: "Valentina",
    lastName: "Kuznetsova",
  });
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(student.email);
  await form.getByLabel("Password").fill(student.password);
  await form.getByRole("button", { name: "Sign in" }).click();

  const menuButton = page
    .getByRole("banner")
    .getByRole("button", { name: /Valentina/ });
  await expect(menuButton).toContainText("VK");
  expect(await overflows(page)).toBe(false);
});
