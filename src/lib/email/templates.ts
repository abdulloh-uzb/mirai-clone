import { siteConfig } from "@/config/site";
import type { EmailMessage } from "./types";

// TODO(spec): plain English text for now; React Email templates in the four
// UI languages come in phase 4.

type Message = Omit<EmailMessage, "to">;

export function contactConfirmation(input: { name: string }): Message {
  return {
    subject: `We received your message - ${siteConfig.name}`,
    text: [
      `Hi ${input.name},`,
      "",
      "Thanks for contacting us. We received your message and will reply by email.",
      "",
      siteConfig.name,
    ].join("\n"),
  };
}

export function contactNotification(input: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): Message {
  return {
    subject: `New contact request (${input.topic}) from ${input.name}`,
    replyTo: input.email,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Topic: ${input.topic}`,
      "",
      input.message,
    ].join("\n"),
  };
}

export function adaConfirmation(input: { name: string }): Message {
  return {
    subject: `We received your accessibility request - ${siteConfig.name}`,
    text: [
      `Hi ${input.name},`,
      "",
      "Thanks for telling us what you need. We received your accessibility request and will contact you using your preferred method.",
      "",
      siteConfig.name,
    ].join("\n"),
  };
}

export function adaNotification(input: {
  name: string;
  email: string;
  phone?: string;
  preferredContact: string;
  need: string;
}): Message {
  return {
    subject: `New accessibility (ADA) request from ${input.name}`,
    replyTo: input.email,
    text: [
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      `Phone: ${input.phone ?? "-"}`,
      `Preferred contact: ${input.preferredContact}`,
      "",
      input.need,
    ].join("\n"),
  };
}
