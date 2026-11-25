"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/auth/actions";
import { newPasswordSchema } from "@/lib/validation/auth";
import { FormErrorAlert, TextField, useAuthAction } from "./form-parts";

export function NewPasswordForm() {
  const t = useTranslations("Auth.resetUpdate");
  const form = useForm<
    z.input<typeof newPasswordSchema>,
    unknown,
    z.output<typeof newPasswordSchema>
  >({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const { onSubmit, pending, formError } = useAuthAction(form, updatePassword);
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormErrorAlert error={formError} />
      <TextField
        id="password"
        type="password"
        label={t("password")}
        autoComplete="new-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <TextField
        id="confirmPassword"
        type="password"
        label={t("confirmPassword")}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...form.register("confirmPassword")}
      />
      <Button type="submit" disabled={pending}>
        {t("submit")}
      </Button>
    </form>
  );
}
