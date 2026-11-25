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

const actions = {
  magicLink: sendMagicLink,
  resetRequest: requestPasswordReset,
} as const;

/** Asks for an email and sends a magic link or a password reset link. */
export function EmailLinkForm({ kind }: { kind: keyof typeof actions }) {
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
    actions[kind],
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
