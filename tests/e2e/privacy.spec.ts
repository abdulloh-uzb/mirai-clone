import { expect, test } from "@playwright/test";
import { createStudentAccount, deleteTestUsers } from "../support/users";

test.afterAll(deleteTestUsers);
test.use({ storageState: { cookies: [], origins: [] } });

test("the consent banner shows once, stores the choice and can be reopened", async ({
  page,
  context,
}) => {
  await page.goto("/faq");
  const banner = page.getByRole("region", { name: "Cookies and analytics" });
  await expect(banner).toBeVisible();
  await banner.getByRole("button", { name: "Decline" }).click();
  await expect(banner).toBeHidden();
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "consent")?.value).toBe("none");

  await page.reload();
  await page.waitForLoadState("networkidle");
  await expect(banner).toBeHidden();
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Privacy choices" })
    .click();
  await expect(banner).toBeVisible();
});

test("a Student downloads their data and requests deletion once", async ({
  page,
}) => {
  const student = await createStudentAccount();
  await page
    .context()
    .addCookies([
      { name: "consent", value: "none", url: "http://localhost:3000" },
    ]);
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(student.email);
  await form.getByLabel("Password").fill(student.password);
  await form.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("banner").getByRole("button", { name: student.firstName }),
  ).toBeVisible();

  await page.goto("/portal/privacy");
  const res = await page.request.get("/api/portal/export");
  expect(res.status()).toBe(200);
  const json = await res.json();
  expect(json.profile.user_id).toBe(student.id);
  expect(JSON.stringify(json)).not.toContain("regulator_ref");

  await page.getByRole("button", { name: "Request account deletion" }).click();
  await expect(page.getByText(/deletion request was received/)).toBeVisible();
});

test("security headers are sent", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
});
