"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { requestPasswordReset, sendMagicLink } from "@/lib/auth/actions";
import { emailOnlySchema } from "@/lib/validation/auth";
import {
  FormAlert,
  FormErrorAlert,
  TextField,
  useAuthAction,
} from "./form-parts";

/**
 * Asks for an email and sends a magic link or a password reset link. A magic
 * link returns to `next` after sign-in; the server re-validates it.
 */
export function EmailLinkForm({
  kind,
  next,
}: {
  kind: "magicLink" | "resetRequest";
  next?: string;
}) {
  const t = useTranslations(`Auth.${kind}`);
  const form = useForm<
    z.input<typeof emailOnlySchema>,
    unknown,
    z.output<typeof emailOnlySchema>
  >({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "" },
  });
  const { onSubmit, pending, formError, sent } = useAuthAction(
    form,
    (values, locale) =>
      kind === "magicLink"
        ? sendMagicLink(values, locale, next)
        : requestPasswordReset(values, locale),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormErrorAlert error={formError} />
      {sent && <FormAlert tone="success">{t("sent")}</FormAlert>}
      <TextField
        id="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <Button type="submit" disabled={pending}>
        {t("submit")}
      </Button>
    </form>
  );
}
