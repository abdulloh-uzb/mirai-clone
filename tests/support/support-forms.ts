import { randomInt } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import { serviceClient } from "./supabase";

// Helpers shared by the support-request E2E specs.

/** Gives the page its own client IP so form rate limits never leak between tests. */
export async function useUniqueIp(page: Page) {
  const ip = `10.${randomInt(256)}.${randomInt(256)}.${randomInt(1, 255)}`;
  await page.setExtraHTTPHeaders({ "X-Forwarded-For": ip });
}

export async function fillContact(
  page: Page,
  values: { name: string; email: string; message?: string },
) {
  const main = page.getByRole("main");
  await main.getByLabel("Your name").fill(values.name);
  await main.getByLabel("Email").fill(values.email);
  await main.getByLabel("Topic").selectOption("course");
  await main
    .getByLabel("Message")
    .fill(values.message ?? "I have a question about the course.");
}

export async function fillAda(
  page: Page,
  values: { name: string; email: string },
) {
  const main = page.getByRole("main");
  await main.getByLabel("Your name").fill(values.name);
  await main.getByLabel("Email", { exact: true }).first().fill(values.email);
  await main
    .getByLabel("What do you need?")
    .fill("I need extra time and a screen reader friendly exam.");
}

/** Opens the "Got a problem?" dialog from the announcement bar. */
export async function openBugDialog(page: Page) {
  await page
    .getByRole("region", { name: "Announcement" })
    .getByRole("button", { name: "Got a problem?" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Got a problem?" });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** A 1x1 PNG. */
export const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

export async function ticketsFor(email: string) {
  const { data, error } = await serviceClient()
    .from("tickets")
    .select("*")
    .eq("email", email);
  if (error) throw error;
  return data;
}

/** Removes the tickets (and their screenshots) created for these emails. */
export async function deleteTicketsFor(emails: string[]) {
  const service = serviceClient();
  for (const email of emails) {
    for (const ticket of await ticketsFor(email)) {
      if (ticket.attachment_path) {
        await service.storage
          .from("support-attachments")
          .remove([ticket.attachment_path]);
      }
      await service.from("tickets").delete().eq("id", ticket.id);
    }
  }
}
