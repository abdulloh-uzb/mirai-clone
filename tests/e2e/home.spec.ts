import { expect, test, type Page } from "@playwright/test";
import { siteConfig } from "../../src/config/site";
import { expectNoSeriousA11yIssues } from "../support/axe";
import { createStudentAccount, deleteTestUsers } from "../support/users";

test.afterAll(deleteTestUsers);

// The reference-design copy is English only for now; other languages fall back to it.
for (const path of ["/", "/ja", "/es", "/ru"]) {
  test(`${path} shows the H1`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "California Traffic School in Your Language.",
    );
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
  await expect(page.getByText("Save $10.00").first()).toBeVisible();
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
  await expect(page.getByRole("link", { name: /^Los Angeles/ })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "See all 58 courts" }),
  ).toHaveAttribute("href", "/courts");
  await expect(page.locator("#faq .v2-acc-i")).toHaveCount(4);
  await page.locator("#faq .v2-acc-q").first().click();
  await expect(page.locator("#faq .v2-acc-a:visible")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Join the waitlist" }),
  ).toHaveAttribute("href", "/courses#classroom");
  await expect(
    page.getByRole("button", { name: /assistant/i }).first(),
  ).toBeVisible();
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
  ).toHaveAttribute("href", "/#courses");

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

test("the reviews are labelled as samples", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Sample reviews written for this demo"),
  ).toBeVisible();
  await expect(page.locator(".rvf-card").first()).toBeAttached();
});

test("the course language cards select in place and update the panel", async ({
  page,
}) => {
  await page.goto("/");
  const group = page.getByRole("radiogroup", { name: "Course language" });
  const english = group.getByRole("radio", { name: /English/ });
  const spanish = group.getByRole("radio", { name: /Español/ });
  await expect(english).toHaveAttribute("aria-checked", "true");
  await expect(
    page.getByText("Lessons, quizzes and the final exam in English."),
  ).toBeVisible();

  await spanish.scrollIntoViewIfNeeded();
  await spanish.click();
  await expect(page).toHaveURL(/\/$/);
  await expect(spanish).toHaveAttribute("aria-checked", "true");
  await expect(english).toHaveAttribute("aria-checked", "false");
  await expect(
    page.getByText("Lessons, quizzes and the final exam in Español."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start in Español" }),
  ).toHaveAttribute("href", "/signup?course=es");

  await spanish.press("ArrowRight");
  await expect(group.getByRole("radio", { name: /Русский/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(
    page.getByRole("link", { name: "Start in Русский" }),
  ).toHaveAttribute("href", "/signup?course=ru");
});
