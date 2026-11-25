import { expect, test, type Page } from "@playwright/test";
import { firstLink, waitForEmail } from "../support/mailpit";
import {
  deleteTestUsers,
  trackUserByEmail,
  uniqueEmail,
} from "../support/users";

test.afterAll(deleteTestUsers);

async function signUpThroughForm(
  page: Page,
  details: { firstName: string; lastName: string; email: string },
) {
  await page.goto("/signup");
  const form = page.getByRole("main");
  await form.getByLabel("First name").fill(details.firstName);
  await form.getByLabel("Last name").fill(details.lastName);
  await form.getByLabel("Email").fill(details.email);
  await form.getByLabel("Password").fill("Correct-horse-1");
  await form.getByLabel("Preferred language").selectOption("en");
  await form.getByRole("button", { name: "Create account" }).click();
}

test("sign-up sends a verification email and shows the banner until it is confirmed", async ({
  page,
}) => {
  const email = uniqueEmail("signup");
  await signUpThroughForm(page, {
    firstName: "Sofia",
    lastName: "Reyes",
    email,
  });

  const banner = page.getByRole("region", { name: "Verify your email" });
  await expect(banner).toBeVisible();
  await trackUserByEmail(email);
  await expect(page.getByRole("button", { name: /Sofia/ })).toBeVisible();

  const first = await waitForEmail(email);
  await banner.getByRole("button", { name: "Resend email" }).click();
  await expect(banner).toContainText("We sent a new link");
  const resent = await waitForEmail(email, { after: [first.ID] });

  await page.goto(firstLink(resent));

  await expect(page.getByRole("button", { name: /Sofia/ })).toBeVisible();
  await expect(banner).toBeHidden();
});
