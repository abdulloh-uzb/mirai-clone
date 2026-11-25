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
  TextField,
  usePublicForm,
} from "@/components/forms/parts";
import { stateWaitlistSchema } from "@/lib/validation/waitlists";
import { joinStateWaitlist } from "@/lib/waitlists/actions";

/** "Notify me" for a state the school does not serve yet: email only. */
export function StateWaitlistForm({
  stateCode,
  stateName,
}: {
  stateCode: string;
  stateName: string;
}) {
  const t = useTranslations("Waitlists.state");
  const form = useForm<
    z.input<typeof stateWaitlistSchema>,
    unknown,
    z.output<typeof stateWaitlistSchema>
  >({
    resolver: zodResolver(stateWaitlistSchema),
    defaultValues: { email: "", stateCode },
    values: { email: "", stateCode },
  });
  const { onSubmit, pending, formError, succeeded } = usePublicForm(
    form,
    (values, honeypot) => joinStateWaitlist({ ...values, website: honeypot }),
  );
  const { errors } = form.formState;

  if (succeeded) {
    return (
      <FormAlert tone="success">{t("success", { state: stateName })}</FormAlert>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-3">
      <FormErrorAlert error={formError} />
      <TextField
        id="state-waitlist-email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <input type="hidden" {...form.register("stateCode")} />
      <ErrorText
        id="state-waitlist-state-error"
        error={errors.stateCode?.message}
      />
      <Honeypot />
      <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
    </form>
  );
}
