"use server";

import { randomUUID } from "node:crypto";
import { siteConfig } from "@/config/site";
import { getCurrentAccount } from "@/lib/auth/current-account";
import type { Json } from "@/lib/database.types";
import { getEmailSender } from "@/lib/email";
import {
  adaConfirmation,
  adaNotification,
  contactConfirmation,
  contactNotification,
} from "@/lib/email/templates";
import { runPublicForm, type PublicFormResult } from "@/lib/forms/public-form";
import { createServiceClient } from "@/lib/supabase/service";
import {
  adaSchema,
  bugReportSchema,
  contactSchema,
  HONEYPOT_FIELD,
  screenshotSchema,
} from "@/lib/validation/support";
import type { Locale } from "@/i18n/routing";

// The three public support forms. Each one inserts a `tickets` row with the
// service role (clients cannot write tickets) after `runPublicForm` has
// checked the honeypot, the rate limit and the input.
//
// The UI language is stored in `details.locale` so replies can use it.
// TODO(spec): confirmation emails are English until the phase 4 templates.

const honeypotOf = (input: unknown): unknown =>
  typeof input === "object" && input !== null
    ? (input as Record<string, unknown>)[HONEYPOT_FIELD]
    : undefined;

async function insertTicket(ticket: {
  type: "contact" | "ada" | "bug";
  userId: string | null;
  email: string;
  body: string;
  pageUrl?: string;
  attachmentPath?: string;
  details?: Json;
  id?: string;
}) {
  const { error } = await createServiceClient()
    .from("tickets")
    .insert({
      id: ticket.id,
      type: ticket.type,
      user_id: ticket.userId,
      email: ticket.email,
      body: ticket.body,
      page_url: ticket.pageUrl ?? null,
      attachment_path: ticket.attachmentPath ?? null,
      details: ticket.details ?? {},
    });
  if (error) throw error;
}

export async function submitContact(
  input: unknown,
  locale: Locale,
): Promise<PublicFormResult> {
  return runPublicForm({
    form: "contact",
    schema: contactSchema,
    input,
    honeypot: honeypotOf(input),
    handle: async (data) => {
      const account = await getCurrentAccount();
      await insertTicket({
        type: "contact",
        userId: account?.userId ?? null,
        email: data.email,
        body: data.message,
        details: { name: data.name, topic: data.topic, locale },
      });
      const sender = getEmailSender();
      await sender.send({ to: data.email, ...contactConfirmation(data) });
      await sender.send({
        to: siteConfig.contact.email,
        ...contactNotification(data),
      });
    },
  });
}

export async function submitAdaRequest(
  input: unknown,
  locale: Locale,
): Promise<PublicFormResult> {
  return runPublicForm({
    form: "ada",
    schema: adaSchema,
    input,
    honeypot: honeypotOf(input),
    handle: async (data) => {
      const account = await getCurrentAccount();
      await insertTicket({
        type: "ada",
        userId: account?.userId ?? null,
        email: data.email,
        body: data.need,
        details: {
          name: data.name,
          preferredContact: data.preferredContact,
          locale,
          ...(data.phone ? { phone: data.phone } : {}),
        },
      });
      const sender = getEmailSender();
      await sender.send({ to: data.email, ...adaConfirmation(data) });
      await sender.send({
        to: siteConfig.contact.email,
        ...adaNotification(data),
      });
    },
  });
}

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export async function submitBugReport(
  formData: FormData,
  locale: Locale,
): Promise<PublicFormResult> {
  const screenshot = formData.get("screenshot");
  const file =
    screenshot instanceof File && screenshot.size > 0 ? screenshot : undefined;
  const account = await getCurrentAccount();
  const input = {
    whatHappened: formData.get("whatHappened"),
    pageUrl: formData.get("pageUrl") ?? "",
    // A signed-in user's own email always wins over what the client sent.
    email: account?.email ?? formData.get("email"),
  };

  return runPublicForm({
    form: "bug",
    schema: bugReportSchema.extend({ screenshot: screenshotSchema }),
    input: { ...input, screenshot: file },
    honeypot: formData.get(HONEYPOT_FIELD),
    handle: async (data) => {
      const ticketId = randomUUID();
      let attachmentPath: string | undefined;
      const file = data.screenshot;
      if (file) {
        const path = `${ticketId}/${randomUUID()}.${EXTENSIONS[file.type]}`;
        const { error } = await createServiceClient()
          .storage.from("support-attachments")
          .upload(path, file, { contentType: file.type });
        if (error) throw error;
        attachmentPath = path;
      }
      await insertTicket({
        id: ticketId,
        type: "bug",
        userId: account?.userId ?? null,
        email: data.email,
        body: data.whatHappened,
        pageUrl: data.pageUrl || undefined,
        attachmentPath,
        details: { locale },
      });
    },
  });
}
