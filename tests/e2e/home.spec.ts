import { expect, test, type Page } from "@playwright/test";
import { siteConfig } from "../../src/config/site";
import { expectNoSeriousA11yIssues } from "../support/axe";
import { createStudentAccount, deleteTestUsers } from "../support/users";

test.afterAll(deleteTestUsers);

const headings = [
  { path: "/", h1: "California traffic school in your language" },
  { path: "/ja", h1: "日本語で受けられるカリフォルニア州トラフィックスクール" },
  { path: "/es", h1: "Escuela de tránsito de California en español" },
  { path: "/ru", h1: "Дорожная школа Калифорнии на русском языке" },
];

for (const { path, h1 } of headings) {
  test(`${path} shows its own H1`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  });
}

async function jsonLdTypes(page: Page) {
  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  return scripts.map((text) => JSON.parse(text) as Record<string, unknown>);
}

test("the hero is honest and shows prices from the database", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText(`Demo traffic school · License ${siteConfig.licenseNumber}`),
  ).toBeVisible();
  await expect(page.getByText("$24.99").first()).toBeVisible();
  await expect(page.getByText("SAVE $10.00")).toBeVisible();
  await expect(page.getByText("Secure Stripe payments")).toBeVisible();
  await expect(
    page.getByText(/DMV-licensed|Accepted in all CA courts/),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Ticket from: California/ }),
  ).toBeVisible();

  const data = await jsonLdTypes(page);
  const org = data.find((d) => d["@type"] === "EducationalOrganization");
  expect(org).toBeDefined();
  expect(org).not.toHaveProperty("aggregateRating");
  expect(data.some((d) => d["@type"] === "Course")).toBe(true);
  await expectNoSeriousA11yIssues(page);
});

test("sections link to courts, the FAQ and the waitlist", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Los Angeles", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "See all 58 courts" }),
  ).toHaveAttribute("href", "/courts");
  const faq = page.locator("section", {
    has: page.getByRole("heading", { name: "Common questions" }),
  });
  await expect(faq.locator("details")).toHaveCount(4);
  await expect(
    page.getByRole("link", { name: "Join the waitlist" }),
  ).toHaveAttribute("href", "/courses#classroom");
  await expect(
    page.getByRole("button", { name: "Try AI assistant" }),
  ).toBeDisabled();
});

test("Enroll Now goes to sign-up for a Visitor and the Portal for a Student", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Enroll Now" }).first(),
  ).toHaveAttribute("href", "/signup?course=en");
  await expect(
    page.getByRole("link", { name: "Explore Courses" }),
  ).toHaveAttribute("href", "/courses");

  const student = await createStudentAccount();
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(student.email);
  await form.getByLabel("Password").fill(student.password);
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("banner").getByRole("button", { name: student.firstName }),
  ).toBeVisible();
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Enroll Now" }).first(),
  ).toHaveAttribute("href", "/portal?course=en");
});

test("the reviews carousel is labelled as samples and works by keyboard", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Sample reviews written for this demo"),
  ).toBeVisible();
  const carousel = page.getByRole("region", { name: "Student reviews" });
  await expect(carousel.getByText("1 / 6")).toBeVisible();
  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(carousel.getByText("2 / 6")).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(carousel.getByText("6 / 6")).toBeVisible();
  // No autoplay: the position stays put.
  await page.waitForTimeout(3000);
  await expect(carousel.getByText("6 / 6")).toBeVisible();
});
