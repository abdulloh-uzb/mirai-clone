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
  // Supabase Auth limits link emails to one per address per `max_frequency`
  // (1s locally), so a resend right after sign-up can be refused. Retry until
  // that window has passed.
  await expect(async () => {
    await banner.getByRole("button", { name: "Resend email" }).click();
    await expect(banner).toContainText("We sent a new link", {
      timeout: 3_000,
    });
  }).toPass({ timeout: 20_000 });
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

test("a Student signs in with a magic link", async ({ page }) => {
  const student = await createStudentAccount({ firstName: "Nadia" });

  await page.goto("/login");
  await page
    .getByRole("link", { name: "Email me a sign-in link instead" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sign in with a link" }),
  ).toBeVisible();
  await page.getByRole("main").getByLabel("Email").fill(student.email);
  await page.getByRole("button", { name: "Email me a link" }).click();
  await expect(page.getByRole("main").getByRole("status")).toContainText(
    "a sign-in link is on its way",
  );

  const email = await waitForEmail(student.email);
  await page.goto(firstLink(email));

  await expect(
    page.getByRole("banner").getByRole("button", { name: /Nadia/ }),
  ).toBeVisible();
});

test("a Student resets their password from the emailed link", async ({
  page,
}) => {
  const student = await createStudentAccount({ firstName: "Omar" });
  const newPassword = "Brand-new-pass-2";

  await page.goto("/login");
  await page.getByRole("link", { name: "Forgot your password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Reset your password" }),
  ).toBeVisible();
  await page.getByRole("main").getByLabel("Email").fill(student.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("main").getByRole("status")).toContainText(
    "a reset link is on its way",
  );

  const email = await waitForEmail(student.email);
  await page.goto(firstLink(email));
  await expect(
    page.getByRole("heading", { name: "Choose a new password" }),
  ).toBeVisible();
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password").fill(newPassword);
  await page.getByRole("button", { name: "Save new password" }).click();
  await expect(
    page.getByRole("banner").getByRole("button", { name: /Omar/ }),
  ).toBeVisible();

  await page.context().clearCookies();
  await signInWithPassword(page, student.email, newPassword);
  await expect(
    page.getByRole("banner").getByRole("button", { name: /Omar/ }),
  ).toBeVisible();
});

test("signing up with a registered email says so", async ({ page }) => {
  const student = await createStudentAccount();

  await signUpThroughForm(page, {
    firstName: "Again",
    lastName: "Student",
    email: student.email,
  });

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "This email is already registered. Sign in instead.",
  );
});

test("the auth pages follow the UI language in the URL", async ({ page }) => {
  await page.goto("/ru/signup");
  await expect(
    page.getByRole("heading", { level: 1, name: "Создайте аккаунт" }),
  ).toBeVisible();
  await page
    .getByRole("main")
    .getByRole("button", { name: "Создать аккаунт" })
    .click();
  await expect(page.getByText("Укажите имя.")).toBeVisible();

  await page.goto("/ja/login");
  await expect(
    page.getByRole("heading", { level: 1, name: "ログイン" }),
  ).toBeVisible();
});
