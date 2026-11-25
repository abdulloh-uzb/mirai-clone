import { expect, test } from "@playwright/test";
import { siteConfig } from "../../src/config/site";
import { expectNoSeriousA11yIssues } from "../support/axe";
import { emailIdsTo, waitForEmail } from "../support/mailpit";
import { serviceClient } from "../support/supabase";
import {
  deleteTicketsFor,
  fillAda,
  fillContact,
  openBugDialog,
  ticketsFor,
  TINY_PNG,
  useUniqueIp,
} from "../support/support-forms";
import {
  createStudentAccount,
  deleteTestUsers,
  uniqueEmail,
} from "../support/users";

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
  await deleteTicketsFor(emails);
  await deleteTestUsers();
});

test("the contact form creates a ticket and emails the sender and the school", async ({
  page,
}) => {
  const email = newEmail("contact");
  const name = `Aiko ${email.slice(8, 16)}`;
  await page.goto("/contact");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Contact us",
  );

  await fillContact(page, { name, email });
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText("your message was sent");
  const confirmation = await waitForEmail(email, { subject: /received/i });
  expect(confirmation.Text).toContain(name);
  const notification = await waitForEmail(siteConfig.contact.email, {
    subject: new RegExp(name),
  });
  expect(notification.Text).toContain("I have a question");

  const [ticket] = await ticketsFor(email);
  expect(ticket).toMatchObject({
    type: "contact",
    status: "open",
    details: { name, topic: "course", locale: "en" },
  });
});

test("a contact form with errors shows them in the UI language", async ({
  page,
}) => {
  await page.goto("/es/contact");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Enviar mensaje" }).click();

  await expect(page.getByText("Escribe tu nombre.")).toBeVisible();
  await expect(page.getByText("Elige un tema.")).toBeVisible();
});

test("a filled honeypot looks like success but creates nothing", async ({
  page,
}) => {
  const email = newEmail("bot");
  await page.goto("/contact");
  await fillContact(page, { name: "Robot", email });
  await page
    .locator('input[name="website"]')
    .evaluate((input: HTMLInputElement) => {
      input.value = "https://spam.example";
    });
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByRole("status")).toContainText("your message was sent");
  expect(await ticketsFor(email)).toEqual([]);
  expect(await emailIdsTo(email)).toEqual([]);
});

test("the sixth submit from one IP is rate limited", async ({ page }) => {
  const email = newEmail("limit");
  for (let attempt = 1; attempt <= 5; attempt++) {
    await page.goto("/contact");
    await fillContact(page, { name: "Sam", email });
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByRole("status")).toBeVisible();
  }

  await page.goto("/contact");
  await fillContact(page, { name: "Sam", email });
  await page.getByRole("button", { name: "Send message" }).click();

  await expect(page.getByText("Too many requests")).toBeVisible();
  expect(await ticketsFor(email)).toHaveLength(5);
});

test("the accessibility page shows in two languages and the form creates a ticket", async ({
  page,
}) => {
  await page.goto("/ja/accessibility");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "アクセシビリティ",
  );

  const email = newEmail("ada");
  await page.goto("/accessibility");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Accessibility",
  );
  await fillAda(page, { name: "Sam Rivera", email });
  await page.getByRole("button", { name: "Send request" }).click();

  await expect(page.getByRole("status")).toContainText("received your request");
  const confirmation = await waitForEmail(email, { subject: /accessibility/i });
  expect(confirmation.Text).toContain("Sam Rivera");
  await waitForEmail(siteConfig.contact.email, {
    subject: /accessibility.*Sam Rivera/,
  });
  const [ticket] = await ticketsFor(email);
  expect(ticket).toMatchObject({
    type: "ada",
    details: { name: "Sam Rivera", preferredContact: "email" },
  });
});

test("Got a problem? sends the page URL and a screenshot", async ({ page }) => {
  const email = newEmail("bug");
  await page.goto("/faq-not-built");
  const dialog = await openBugDialog(page);
  await expect(dialog.getByLabel("Page")).toHaveValue(/\/faq-not-built$/);

  await dialog.getByLabel("What happened?").fill("The page was not found.");
  await dialog.getByLabel("Email").fill(email);
  await dialog.getByLabel("Screenshot (optional)").setInputFiles({
    name: "shot.png",
    mimeType: "image/png",
    buffer: TINY_PNG,
  });
  await dialog.getByRole("button", { name: "Send report" }).click();

  await expect(dialog.getByRole("status")).toContainText("got your report");
  const [ticket] = await ticketsFor(email);
  expect(ticket).toMatchObject({ type: "bug", user_id: null });
  expect(ticket.page_url).toMatch(/\/faq-not-built$/);
  expect(ticket.attachment_path).toMatch(/^[\w-]+\/[\w-]+\.png$/);
  const download = await serviceClient()
    .storage.from("support-attachments")
    .download(ticket.attachment_path ?? "");
  expect(download.error).toBeNull();
  expect(download.data?.size).toBe(TINY_PNG.length);
});

test("a screenshot of the wrong type is refused in the dialog", async ({
  page,
}) => {
  await page.goto("/");
  const dialog = await openBugDialog(page);
  await dialog
    .getByLabel("Screenshot (optional)")
    .setInputFiles({ name: "a.gif", mimeType: "image/gif", buffer: TINY_PNG });
  await expect(dialog).toContainText("Use a PNG, JPEG or WebP image.");
});

test("Got a problem? is also in the footer", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Got a problem?" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Got a problem?" }),
  ).toBeVisible();
});

test("a signed-in Student's email is prefilled and read-only", async ({
  page,
}) => {
  const student = await createStudentAccount({ firstName: "Priya" });
  await page.goto("/login");
  const main = page.getByRole("main");
  await main.getByLabel("Email").fill(student.email);
  await main.getByLabel("Password").fill(student.password);
  await main.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("banner").getByRole("button", { name: "Priya" }),
  ).toBeVisible();

  emails.push(student.email);
  const dialog = await openBugDialog(page);
  const emailField = dialog.getByLabel("Email");
  await expect(emailField).toHaveValue(student.email);
  await expect(emailField).toHaveAttribute("readonly", "");

  await dialog.getByLabel("What happened?").fill("Something odd happened.");
  await dialog.getByRole("button", { name: "Send report" }).click();
  await expect(dialog.getByRole("status")).toBeVisible();
  const [ticket] = await ticketsFor(student.email);
  expect(ticket.user_id).toBe(student.id);
});

test("the forms have no serious accessibility issues", async ({ page }) => {
  await page.goto("/contact");
  await expectNoSeriousA11yIssues(page);
  await page.goto("/accessibility");
  await expectNoSeriousA11yIssues(page);
  await openBugDialog(page);
  await expectNoSeriousA11yIssues(page);
});
