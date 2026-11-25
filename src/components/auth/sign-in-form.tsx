"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth/actions";
import { signInSchema } from "@/lib/validation/auth";
import { Link } from "@/i18n/navigation";
import { FormErrorAlert, TextField, useAuthAction } from "./form-parts";

export function SignInForm() {
  const t = useTranslations("Auth.signIn");
  const form = useForm<
    z.input<typeof signInSchema>,
    unknown,
    z.output<typeof signInSchema>
  >({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { onSubmit, pending, formError } = useAuthAction(form, signIn);
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormErrorAlert error={formError} />
      <TextField
        id="email"
        type="email"
        label={t("email")}
        autoComplete="email"
        error={errors.email?.message}
        {...form.register("email")}
      />
      <TextField
        id="password"
        type="password"
        label={t("password")}
        autoComplete="current-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <Link
        href="/reset-password"
        className="justify-self-start text-sm font-medium text-primary underline"
      >
        {t("forgotPassword")}
      </Link>
      <Button type="submit" disabled={pending}>
        {t("submit")}
      </Button>
      <Link
        href="/login/magic-link"
        className="justify-self-center text-sm font-medium text-primary underline"
      >
        {t("magicLink")}
      </Link>
    </form>
  );
}
