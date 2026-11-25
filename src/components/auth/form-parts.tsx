"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionResult, AuthFormErrorKey } from "@/lib/auth/actions";
import type { AuthErrorKey } from "@/lib/validation/auth";
import type { Locale } from "@/i18n/routing";

type ErrorKey = AuthErrorKey | AuthFormErrorKey;

const ERROR_KEYS: readonly ErrorKey[] = [
  "firstNameRequired",
  "lastNameRequired",
  "nameTooLong",
  "emailInvalid",
  "passwordRequired",
  "passwordTooShort",
  "passwordTooLong",
  "passwordsDoNotMatch",
  "localeInvalid",
  "invalidCredentials",
  "emailTaken",
  "rateLimited",
  "generic",
];

function asErrorKey(value: string | undefined): ErrorKey | null {
  if (!value) return null;
  return ERROR_KEYS.find((key) => key === value) ?? "generic";
}

export function ErrorText({ id, error }: { id: string; error?: string }) {
  const t = useTranslations("Auth.errors");
  const key = asErrorKey(error);
  if (!key) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {t(key)}
    </p>
  );
}

type FieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
};

export function TextField({ id, label, error, hint, ...input }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        {...input}
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}

export function FormAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          : "rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm"
      }
    >
      {children}
    </p>
  );
}

export function FormErrorAlert({ error }: { error: AuthFormErrorKey | null }) {
  const t = useTranslations("Auth.errors");
  if (!error) return null;
  return <FormAlert tone="error">{t(error)}</FormAlert>;
}

/**
 * Submits a react-hook-form form to an auth server action and maps the
 * result back: field errors onto fields, form errors into an alert, and
 * "sent" into a success state. A redirect from the action navigates away.
 */
export function useAuthAction<TIn extends FieldValues, TOut>(
  form: UseFormReturn<TIn, unknown, TOut>,
  action: (input: TOut, locale: Locale) => Promise<AuthActionResult>,
) {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<AuthFormErrorKey | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      setFormError(null);
      const result = await action(values, locale);
      if (result.status === "sent") {
        setSent(true);
        return;
      }
      if (result.formError) setFormError(result.formError);
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        form.setError(field as Path<TIn>, { message });
      }
    }),
  );

  return { onSubmit, pending, formError, sent };
}
