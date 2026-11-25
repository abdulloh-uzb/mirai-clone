import { expect, test } from "@playwright/test";
import { uniqueEmail } from "../support/users";
import {
  deleteTicketsFor,
  fillAda,
  fillContact,
  openBugDialog,
  ticketsFor,
  useUniqueIp,
} from "../support/support-forms";

const emails: string[] = [];

test.beforeEach(async ({ page }) => {
  await useUniqueIp(page);
});

test.afterAll(async () => {
  await deleteTicketsFor(emails);
});

test("the contact form submits on a phone", async ({ page }) => {
  const email = uniqueEmail("m-contact");
  emails.push(email);
  await page.goto("/contact");
  await fillContact(page, { name: "Mika", email });
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("status")).toContainText("your message was sent");
  expect(await ticketsFor(email)).toHaveLength(1);
});

test("the accessibility request form submits on a phone", async ({ page }) => {
  const email = uniqueEmail("m-ada");
  emails.push(email);
  await page.goto("/accessibility");
  await fillAda(page, { name: "Mika", email });
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByRole("status")).toContainText("received your request");
  expect(await ticketsFor(email)).toHaveLength(1);
});

test("Got a problem? submits on a phone", async ({ page }) => {
  const email = uniqueEmail("m-bug");
  emails.push(email);
  await page.goto("/");
  const dialog = await openBugDialog(page);
  await dialog.getByLabel("What happened?").fill("The menu would not open.");
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByRole("status")).toContainText("got your report");
  expect(await ticketsFor(email)).toHaveLength(1);
});
