import { expect, test, type Page } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";
import { serviceClient } from "../support/supabase";
import {
  createStudentAccount,
  deleteTestUsers,
  trackUserByEmail,
  uniqueEmail,
} from "../support/users";

test.afterAll(deleteTestUsers);

async function onlinePrice(): Promise<string> {
  const { data, error } = await serviceClient()
    .from("courses")
    .select("price_cents")
    .eq("slug", "california-traffic-violator-course")
    .single();
  if (error) throw error;
  return (data.price_cents / 100).toFixed(2);
}

async function courseJsonLd(page: Page) {
  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return scripts
    .map((text) => JSON.parse(text) as { "@type": string })
    .find((data) => data["@type"] === "Course") as
    { offers: { price: string; priceCurrency: string } } | undefined;
}

test("/courses renders the cards, the panel and honest wording", async ({
  page,
}) => {
  await page.goto("/courses");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const cards = page.getByRole("navigation", { name: "Course languages" });
  await expect(cards.getByRole("link")).toHaveCount(4);
  await expect(cards.getByText("Original course")).toBeVisible();
  await expect(
    page.getByText("Built to DMV course rules (demo)"),
  ).toBeVisible();
  await expect(page.getByText(/DMV-licensed/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /8 sections/ })).toBeVisible();

  const jsonLd = await courseJsonLd(page);
  expect(jsonLd?.offers).toMatchObject({
    price: await onlinePrice(),
    priceCurrency: "USD",
  });
  await expectNoSeriousA11yIssues(page);
});

test("/ru/courses renders in Russian", async ({ page }) => {
  await page.goto("/ru/courses");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Выберите язык обучения",
  );
  await expect(
    page.getByRole("link", { name: "Начать: Русский" }),
  ).toBeVisible();
});

test("picking Japanese keeps it through sign-up to the Portal", async ({
  page,
}) => {
  await page.goto("/courses");
  await page
    .getByRole("navigation", { name: "Course languages" })
    .getByRole("link", { name: /日本語/ })
    .click();
  await expect(page).toHaveURL(/\?course=ja$/);
  await expect(
    page.getByText("Lessons, quizzes and the final exam in 日本語."),
  ).toBeVisible();

  const start = page.getByRole("link", { name: "Start in 日本語" });
  await expect(start).toHaveAttribute("href", "/signup?course=ja");
  await start.click();

  const email = uniqueEmail("course-signup");
  const form = page.getByRole("main");
  await form.getByLabel("First name").fill("Kenji");
  await form.getByLabel("Last name").fill("Mori");
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill("Correct-horse-1");
  await form.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/portal\?course=ja$/);
  await trackUserByEmail(email);
  await expect(
    page.getByRole("button", { name: /Pay \$24\.99/ }),
  ).toBeVisible();
});

test("a signed-in Student's button goes straight to the Portal", async ({
  page,
}) => {
  const student = await createStudentAccount();
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(student.email);
  await form.getByLabel("Password").fill(student.password);
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("banner").getByRole("button", { name: student.firstName }),
  ).toBeVisible();

  await page.goto("/courses?course=es");
  await expect(
    page.getByRole("link", { name: "Start in Español" }),
  ).toHaveAttribute("href", "/portal?course=es");
});
