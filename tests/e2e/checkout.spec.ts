import { expect, test } from "@playwright/test";
import {
  createStudentAccount,
  deleteTestUsers,
  serviceClient,
} from "../support/users";

test.afterAll(deleteTestUsers);

// Runs in mock payments mode (no STRIPE_SECRET_KEY): checkout goes through
// /api/stripe/mock-checkout, which feeds the same handler as the real webhook.
test("a verified Student pays in Japanese and is enrolled once", async ({
  page,
}) => {
  const student = await createStudentAccount({ verified: true });
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(student.email);
  await form.getByLabel("Password").fill(student.password);
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("banner").getByRole("button", { name: student.firstName }),
  ).toBeVisible();

  await page.goto("/portal");
  await page
    .getByRole("navigation", { name: "Course languages" })
    .getByRole("link", { name: /日本語/ })
    .click();
  await page
    .getByRole("button", { name: /Pay \$24\.99 and start in 日本語/ })
    .click();

  // The mock page navigates to the mock route, which ends on /portal?paid=1.
  await expect(page).toHaveURL(/\/portal\?paid=1/);
  await expect(page.getByRole("link", { name: "Continue" })).toBeVisible();
  await expect(
    page.getByText("You will be asked for your driver details"),
  ).toBeVisible();

  const count = async () => {
    const { count: n } = await serviceClient
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", student.id);
    return n;
  };
  expect(await count()).toBe(1);

  // Replaying the mock event creates nothing new.
  const { data: order } = await serviceClient
    .from("orders")
    .select("id")
    .eq("user_id", student.id)
    .single();
  await page.goto(`/api/stripe/mock-checkout?order=${order?.id}`);
  expect(await count()).toBe(1);
});
