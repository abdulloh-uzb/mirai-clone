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
  TextField,
  usePublicForm,
} from "@/components/forms/parts";
import { classroomWaitlistSchema } from "@/lib/validation/waitlists";
import { joinClassroomWaitlist } from "@/lib/waitlists/actions";

/** The in-person classroom waitlist: email and County. */
export function ClassroomWaitlistForm({
  counties,
}: {
  counties: { slug: string; name: string }[];
}) {
  const t = useTranslations("Waitlists.classroom");
  const form = useForm<
    z.input<typeof classroomWaitlistSchema>,
    unknown,
    z.output<typeof classroomWaitlistSchema>
  >({
    resolver: zodResolver(classroomWaitlistSchema),
    defaultValues: { email: "", countySlug: "" },
  });
  const { onSubmit, pending, formError, succeeded } = usePublicForm(
    form,
    (values, honeypot, locale) =>
      joinClassroomWaitlist({ ...values, website: honeypot }, locale),
  );
  const { errors } = form.formState;

  if (succeeded) return <FormAlert tone="success">{t("success")}</FormAlert>;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4">
      <FormErrorAlert error={formError} />
      <TextField
        id="classroom-email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <SelectField
        id="classroom-county"
        label={t("county")}
        error={errors.countySlug?.message}
        {...form.register("countySlug")}
      >
        <option value="">{t("countyPlaceholder")}</option>
        {counties.map((county) => (
          <option key={county.slug} value={county.slug}>
            {county.name}
          </option>
        ))}
      </SelectField>
      <Honeypot />
      <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
    </form>
  );
}
