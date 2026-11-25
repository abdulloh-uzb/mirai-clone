"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth/actions";
import { signUpSchema } from "@/lib/validation/auth";
import { routing } from "@/i18n/routing";
import {
  ErrorText,
  FormErrorAlert,
  TextField,
  useAuthAction,
} from "./form-parts";

// Native names, so anyone can find their own language.
const LANGUAGE_NAMES = {
  en: "English",
  ja: "日本語",
  es: "Español",
  ru: "Русский",
} as const satisfies Record<(typeof routing.locales)[number], string>;

export function SignUpForm() {
  const t = useTranslations("Auth.signUp");
  const locale = useLocale();
  const form = useForm<
    z.input<typeof signUpSchema>,
    unknown,
    z.output<typeof signUpSchema>
  >({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      preferredLocale: locale,
    },
  });
  const { onSubmit, pending, formError } = useAuthAction(form, signUp);
  const { errors } = form.formState;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormErrorAlert error={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="firstName"
          label={t("firstName")}
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...form.register("firstName")}
        />
        <TextField
          id="lastName"
          label={t("lastName")}
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...form.register("lastName")}
        />
      </div>
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
        hint={t("passwordHint")}
        autoComplete="new-password"
        error={errors.password?.message}
        {...form.register("password")}
      />
      <div className="grid gap-2">
        <Label htmlFor="preferredLocale">{t("preferredLanguage")}</Label>
        <select
          id="preferredLocale"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 md:text-sm"
          aria-invalid={errors.preferredLocale ? true : undefined}
          {...form.register("preferredLocale")}
        >
          {routing.locales.map((code) => (
            <option key={code} value={code} lang={code}>
              {LANGUAGE_NAMES[code]}
            </option>
          ))}
        </select>
        <ErrorText
          id="preferredLocale-error"
          error={errors.preferredLocale?.message}
        />
      </div>
      <Button type="submit" disabled={pending} className="mt-2">
        {t("submit")}
      </Button>
    </form>
  );
}
