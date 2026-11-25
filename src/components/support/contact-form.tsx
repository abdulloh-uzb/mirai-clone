"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  FormAlert,
  FormErrorAlert,
  Honeypot,
  SelectField,
  SubmitButton,
  TextareaField,
  TextField,
  usePublicForm,
} from "@/components/forms/parts";
import { submitContact } from "@/lib/support/actions";
import { CONTACT_TOPICS, contactSchema } from "@/lib/validation/support";

/** `accountEmail` prefills the email for a signed-in Student. */
export function ContactForm({ accountEmail }: { accountEmail?: string }) {
  const t = useTranslations("Contact.form");
  const form = useForm<
    z.input<typeof contactSchema>,
    unknown,
    z.output<typeof contactSchema>
  >({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: accountEmail ?? "",
      topic: "" as never,
      message: "",
    },
  });
  const { onSubmit, pending, formError, succeeded } = usePublicForm(
    form,
    (values, honeypot, locale) =>
      submitContact({ ...values, website: honeypot }, locale),
  );
  const { errors } = form.formState;

  if (succeeded) return <FormAlert tone="success">{t("success")}</FormAlert>;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <FormErrorAlert error={formError} />
      <TextField
        id="contact-name"
        label={t("name")}
        autoComplete="name"
        error={errors.name?.message}
        {...form.register("name")}
      />
      <TextField
        id="contact-email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <SelectField
        id="contact-topic"
        label={t("topic")}
        error={errors.topic?.message}
        {...form.register("topic")}
      >
        <option value="">{t("topicPlaceholder")}</option>
        {CONTACT_TOPICS.map((topic) => (
          <option key={topic} value={topic}>
            {t(`topics.${topic}`)}
          </option>
        ))}
      </SelectField>
      <TextareaField
        id="contact-message"
        label={t("message")}
        error={errors.message?.message}
        {...form.register("message")}
      />
      <Honeypot />
      <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
    </form>
  );
}
