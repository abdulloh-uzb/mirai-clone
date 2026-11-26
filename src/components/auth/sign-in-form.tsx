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

/** `next` is where to return after signing in; the server re-validates it. */
export function SignInForm({ next }: { next?: string }) {
  const t = useTranslations("Auth.signIn");
  const form = useForm<
    z.input<typeof signInSchema>,
    unknown,
    z.output<typeof signInSchema>
  >({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { onSubmit, pending, formError } = useAuthAction(
    form,
    (values, locale) => signIn(values, locale, next),
  );
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
        className="-mt-1 justify-self-start text-[15px] font-bold text-blue-text underline underline-offset-3 hover:text-primary"
      >
        {t("forgotPassword")}
      </Link>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {t("submit")}
      </Button>
      <Link
        href={{
          pathname: "/login/magic-link",
          query: next ? { next } : {},
        }}
        className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-line-blue bg-hero px-5 text-[15px] font-bold text-foreground transition-colors hover:bg-line-blue"
      >
        {t("magicLink")}
      </Link>
    </form>
  );
}
