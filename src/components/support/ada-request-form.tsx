"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  ErrorText,
  FormAlert,
  FormErrorAlert,
  Honeypot,
  SubmitButton,
  TextareaField,
  TextField,
  usePublicForm,
} from "@/components/forms/parts";
import { submitAdaRequest } from "@/lib/support/actions";
import { adaSchema, PREFERRED_CONTACTS } from "@/lib/validation/support";

export function AdaRequestForm({ accountEmail }: { accountEmail?: string }) {
  const t = useTranslations("Accessibility.form");
  const form = useForm<
    z.input<typeof adaSchema>,
    unknown,
    z.output<typeof adaSchema>
  >({
    resolver: zodResolver(adaSchema),
    defaultValues: {
      name: "",
      email: accountEmail ?? "",
      phone: "",
      need: "",
      preferredContact: "email",
    },
  });
  const { onSubmit, pending, formError, succeeded } = usePublicForm(
    form,
    (values, honeypot, locale) =>
      submitAdaRequest({ ...values, website: honeypot }, locale),
  );
  const { errors } = form.formState;

  if (succeeded) return <FormAlert tone="success">{t("success")}</FormAlert>;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <FormErrorAlert error={formError} />
      <TextField
        id="ada-name"
        label={t("name")}
        autoComplete="name"
        error={errors.name?.message}
        {...form.register("name")}
      />
      <TextField
        id="ada-email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <TextField
        id="ada-phone"
        type="tel"
        label={t("phone")}
        autoComplete="tel"
        error={errors.phone?.message}
        {...form.register("phone")}
      />
      <TextareaField
        id="ada-need"
        label={t("need")}
        hint={t("needHint")}
        error={errors.need?.message}
        {...form.register("need")}
      />
      <fieldset
        className="grid gap-2"
        aria-describedby={
          errors.preferredContact ? "ada-contact-error" : undefined
        }
      >
        <legend className="text-sm font-medium">{t("preferredContact")}</legend>
        {PREFERRED_CONTACTS.map((value) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value={value}
              className="size-4 accent-primary"
              {...form.register("preferredContact")}
            />
            {value === "email" ? t("contactEmail") : t("contactPhone")}
          </label>
        ))}
        <ErrorText
          id="ada-contact-error"
          error={errors.preferredContact?.message}
        />
      </fieldset>
      <Honeypot />
      <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
    </form>
  );
}
