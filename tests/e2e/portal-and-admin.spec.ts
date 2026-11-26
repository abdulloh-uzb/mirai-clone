import { expect, test, type Page } from "@playwright/test";
import {
  createAdminAccount,
  createStudentAccount,
  deleteTestUsers,
  type TestAccount,
} from "../support/users";

test.afterAll(deleteTestUsers);

async function fillSignIn(page: Page, account: TestAccount) {
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(account.email);
  await form.getByLabel("Password").fill(account.password);
  await form.getByRole("button", { name: "Sign in" }).click();
}

async function signIn(page: Page, account: TestAccount) {
  await page.goto("/login");
  await fillSignIn(page, account);
  await expect(
    page.getByRole("banner").getByRole("button", { name: account.firstName }),
  ).toBeVisible();
}

const notIndexable = (page: Page) =>
  expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

test("a Visitor opening the Portal signs in and lands back on the Portal", async ({
  page,
}) => {
  const student = await createStudentAccount({ firstName: "Priya" });

  await page.goto("/portal");

  await expect(page).toHaveURL(/\/login\?next=%2Fportal$/);
  await fillSignIn(page, student);

  await expect(page).toHaveURL(/localhost:\d+\/portal$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "My courses" }),
  ).toBeVisible();
  await notIndexable(page);
});

test("the Portal sign-in keeps the UI language of the Portal URL", async ({
  page,
}) => {
  const student = await createStudentAccount({ firstName: "Ivan" });

  await page.goto("/ru/portal");

  await expect(page).toHaveURL(/\/ru\/login\?next=%2Fru%2Fportal$/);
  const form = page.getByRole("main");
  await form.getByLabel("Электронная почта").fill(student.email);
  await form.getByLabel("Пароль").fill(student.password);
  await form.getByRole("button", { name: "Войти" }).click();

  await expect(page).toHaveURL(/\/ru\/portal$/);
});

test("a sign-in link that points off-site returns home instead", async ({
  page,
}) => {
  const student = await createStudentAccount({ firstName: "Grace" });

  await page.goto("/login?next=//evil.example/portal");
  await fillSignIn(page, student);

  await expect(
    page.getByRole("banner").getByRole("button", { name: "Grace" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/localhost:\d+\/$/);
});

test("a Student gets the 404 page on the Admin area", async ({ page }) => {
  const student = await createStudentAccount({ firstName: "Tomas" });
  await signIn(page, student);

  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { name: "This page took a wrong turn" }),
  ).toBeVisible();
});

test("a Visitor gets the 404 page on the Admin area", async ({ page }) => {
  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { name: "This page took a wrong turn" }),
  ).toBeVisible();
});

test("an Admin reaches the Admin area", async ({ page }) => {
  const admin = await createAdminAccount({ firstName: "Ada" });
  await signIn(page, admin);

  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { level: 1, name: "Dashboard" }),
  ).toBeVisible();
  await notIndexable(page);
});

test("a Student's saved UI language applies at the root on a fresh browser", async ({
  page,
  browser,
}) => {
  const student = await createStudentAccount({ firstName: "Kenji" });
  await signIn(page, student);
  await page.goto("/faq");

  await page.getByRole("button", { name: /^(EN|JA|ES|RU)\b/ }).click();
  await page.getByRole("link", { name: "日本語" }).click();
  await expect(page).toHaveURL(/\/ja\/faq$/);

  const fresh = await browser.newContext();
  const other = await fresh.newPage();
  try {
    await signIn(other, student);
    await other.goto("/");
    await expect(other).toHaveURL(/\/ja$/);

    // A deep unprefixed path still stays English.
    await other.goto("/faq");
    await expect(other).toHaveURL(/localhost:\d+\/faq$/);
  } finally {
    await fresh.close();
  }
});
