import { expect, test, type Page } from "@playwright/test";
import { firstLink, waitForEmail } from "../support/mailpit";
import {
  createStudentAccount,
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

async function signInWithPassword(page: Page, email: string, password: string) {
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(email);
  await form.getByLabel("Password").fill(password);
  await form.getByRole("button", { name: "Sign in" }).click();
}

test("a Student signs in with a password, sees their menu, and signs out", async ({
  page,
}) => {
  const student = await createStudentAccount({
    firstName: "Marcus",
    lastName: "Lee",
  });

  await signInWithPassword(page, student.email, student.password);

  const menuButton = page.getByRole("banner").getByRole("button", {
    name: /Marcus/,
  });
  await expect(menuButton).toBeVisible();
  await expect(menuButton).toContainText("ML");
  await menuButton.click();
  const menu = page.getByRole("menu");
  for (const item of ["My courses", "My certificates", "My profile"]) {
    await expect(menu.getByRole("menuitem", { name: item })).toBeVisible();
  }
  await menu.getByRole("menuitem", { name: "Log out" }).click();

  await expect(
    page.getByRole("banner").getByRole("link", { name: "Create account" }),
  ).toBeVisible();
  await expect(menuButton).toBeHidden();
});

test("a wrong password gets the same generic message as an unknown email", async ({
  page,
}) => {
  const student = await createStudentAccount();
  const alert = page.getByRole("main").getByRole("alert");

  await signInWithPassword(page, student.email, "Wrong-password-1");
  await expect(alert).toHaveText("Email or password is incorrect.");

  await signInWithPassword(page, uniqueEmail("nobody"), "Wrong-password-1");
  await expect(alert).toHaveText("Email or password is incorrect.");
});
