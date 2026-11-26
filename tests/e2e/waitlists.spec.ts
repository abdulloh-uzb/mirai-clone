import { expect, test } from "@playwright/test";
import { serviceClient } from "../support/supabase";
import { useUniqueIp } from "../support/support-forms";
import { uniqueEmail } from "../support/users";

const emails: string[] = [];
const newEmail = (prefix: string) => {
  const email = uniqueEmail(prefix);
  emails.push(email);
  return email;
};

test.beforeEach(async ({ page }) => {
  await useUniqueIp(page);
});

test.afterAll(async () => {
  await serviceClient().from("state_waitlist").delete().in("email", emails);
  await serviceClient().from("classroom_waitlist").delete().in("email", emails);
});

test("choosing Texas offers notify me and keeps the choice", async ({
  page,
}) => {
  const email = newEmail("state-wait");
  await page.goto("/courses");
  await page.getByRole("button", { name: /Ticket from: California/ }).click();
  await page.getByLabel("Where is your ticket from?").selectOption("TX");
  await expect(page.getByText("Coming soon — notify me")).toBeVisible();
  await page.locator("#state-waitlist-email").fill(email);
  await page
    .locator("form")
    .filter({ has: page.locator("#state-waitlist-email") })
    .getByRole("button", { name: "Notify me" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "when Texas opens" }),
  ).toBeVisible();

  const { data } = await serviceClient()
    .from("state_waitlist")
    .select("state_code")
    .eq("email", email);
  expect(data).toEqual([{ state_code: "TX" }]);

  await page.reload();
  await expect(
    page.getByRole("button", { name: /Ticket from: Texas/ }),
  ).toBeVisible();
});

test("the classroom waitlist stores email and County", async ({ page }) => {
  const email = newEmail("classroom-wait");
  await page.goto("/courses");
  const card = page.locator("#classroom");
  await card.getByLabel("Email").fill(email);
  await card.getByLabel("County").selectOption("fresno-county");
  await card.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(card.getByRole("status")).toContainText("classroom waitlist");

  const { data } = await serviceClient()
    .from("classroom_waitlist")
    .select("locale, counties(slug)")
    .eq("email", email);
  expect(data).toEqual([{ locale: "en", counties: { slug: "fresno-county" } }]);
});

test("validation errors are translated", async ({ page }) => {
  await page.goto("/ja/courses");
  await page.waitForLoadState("networkidle");
  const card = page.locator("#classroom");
  await card.getByRole("button", { name: "ウェイトリストに登録" }).click();
  await expect(card).toContainText("有効なメールアドレスを入力してください。");
  await expect(card).toContainText("郡を選択してください。");
});

test("a filled honeypot gets a fake success and stores nothing", async ({
  page,
}) => {
  const email = newEmail("classroom-bot");
  await page.goto("/courses");
  const card = page.locator("#classroom");
  await card.getByLabel("Email").fill(email);
  await card.getByLabel("County").selectOption("kern-county");
  await card
    .locator('input[name="website"]')
    .evaluate((input: HTMLInputElement) => (input.value = "spam"));
  await card.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(card.getByRole("status")).toContainText("classroom waitlist");

  const { data } = await serviceClient()
    .from("classroom_waitlist")
    .select("id")
    .eq("email", email);
  expect(data).toEqual([]);
});
