import { test, type Page } from "@playwright/test";
import { expectNoSeriousA11yIssues } from "../support/axe";
import {
  completeLessons,
  enrolledStudent,
  loadCourse,
} from "../support/course";
import {
  createAdminAccount,
  deleteTestUsers,
  type TestAccount,
} from "../support/users";

test.afterAll(deleteTestUsers);

// Public pages, checked in English and in Russian.
const publicPaths = [
  "/",
  "/courses",
  "/courts",
  "/courts/los-angeles-county",
  "/dmv-services",
  "/eligibility",
  "/faq",
  "/blog",
  "/whats-new",
  "/about",
  "/contact",
  "/verify",
  "/accessibility",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/school-rules",
  "/login",
  "/signup",
  "/reset-password",
];

async function checkPaths(page: Page, paths: string[]) {
  for (const path of paths) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    try {
      await expectNoSeriousA11yIssues(page);
    } catch (error) {
      throw new Error(`${path}: ${(error as Error).message}`);
    }
  }
}

for (const prefix of ["", "/ru"]) {
  test(`no serious axe issues on public pages (${prefix || "en"})`, async ({
    page,
  }) => {
    test.setTimeout(240_000);
    await checkPaths(
      page,
      publicPaths.map((p) => (p === "/" ? prefix || "/" : `${prefix}${p}`)),
    );
  });
}

async function signIn(page: Page, account: TestAccount) {
  await page.goto("/login");
  const form = page.getByRole("main");
  await form.getByLabel("Email").fill(account.email);
  await form.getByLabel("Password").fill(account.password);
  await form.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
}

test("no serious axe issues in the Portal", async ({ page }) => {
  test.setTimeout(240_000);
  const { courseId, countyId, lessons } = await loadCourse();
  const { user, enrollmentId } = await enrolledStudent(courseId, countyId);
  await completeLessons(enrollmentId, lessons);
  await signIn(page, user);
  await checkPaths(page, [
    "/portal",
    `/portal/course/${enrollmentId}/1`,
    `/portal/exam/${enrollmentId}`,
    `/portal/status/${enrollmentId}`,
    "/portal/certificates",
    "/portal/orders",
    "/portal/profile",
  ]);
});

test("no serious axe issues on the Admin dashboard", async ({ page }) => {
  test.setTimeout(120_000);
  const admin = await createAdminAccount();
  await signIn(page, admin);
  await checkPaths(page, ["/admin", "/admin/students", "/admin/orders"]);
});
