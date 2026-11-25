"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useState,
  useTransition,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicFormResult } from "@/lib/forms/public-form";
import { cn } from "@/lib/utils";
import {
  HONEYPOT_FIELD,
  isFormMessageKey,
  type FormErrorKey,
  type FormMessageKey,
} from "@/lib/validation/support";
import type { Locale } from "@/i18n/routing";

// Generic field parts for the public forms. Error messages are keys under
// `Forms.errors`, translated here.

function asErrorKey(value: string | undefined): FormMessageKey | null {
  if (!value) return null;
  return isFormMessageKey(value) ? value : "generic";
}

export function ErrorText({ id, error }: { id: string; error?: string }) {
  const t = useTranslations("Forms.errors");
  const key = asErrorKey(error);
  if (!key) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {t(key)}
    </p>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  return (
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined
  );
}

type Common = { id: string; label: string; error?: string; hint?: string };

function Field({
  id,
  label,
  error,
  hint,
  children,
}: Common & { children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  ...input
}: Common & ComponentProps<typeof Input>) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...input}
      />
    </Field>
  );
}

const controlClass =
  "w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm dark:bg-input/30";

export function TextareaField({
  id,
  label,
  error,
  hint,
  ...textarea
}: Common & ComponentProps<"textarea">) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <textarea
        id={id}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass, "min-h-28")}
        {...textarea}
      />
    </Field>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  children,
  ...select
}: Common & ComponentProps<"select">) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlClass, "h-9 py-1")}
        {...select}
      >
        {children}
      </select>
    </Field>
  );
}

/** Hidden bot trap: real users never see or tab to it. */
export function Honeypot() {
  const t = useTranslations("Forms");
  return (
    <div
      aria-hidden
      className="absolute -left-[9999px] size-px overflow-hidden"
    >
      <label>
        {t("honeypotLabel")}
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
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

export function FormErrorAlert({ error }: { error: FormErrorKey | null }) {
  const t = useTranslations("Forms.errors");
  if (!error) return null;
  return <FormAlert tone="error">{t(error)}</FormAlert>;
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: ReactNode;
}) {
  return (
    <Button type="submit" disabled={pending}>
      {children}
    </Button>
  );
}

/**
 * Submits a react-hook-form form to a public-form server action and maps the
 * result back: field errors onto fields, form errors into an alert, and "ok"
 * into a success state. The honeypot value is read from the DOM form because
 * the Zod resolver strips fields the schema does not know.
 */
export function usePublicForm<TIn extends FieldValues, TOut>(
  form: UseFormReturn<TIn, unknown, TOut>,
  submit: (
    values: TOut,
    honeypot: string,
    locale: Locale,
  ) => Promise<PublicFormResult>,
) {
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<FormErrorKey | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const onSubmit = form.handleSubmit((values, event) => {
    const honeypot = event?.target
      ? new FormData(event.target as HTMLFormElement).get(HONEYPOT_FIELD)
      : "";
    return new Promise<void>((resolve) =>
      startTransition(async () => {
        setFormError(null);
        const result = await submit(
          values,
          typeof honeypot === "string" ? honeypot : "",
          locale,
        );
        if (result.status === "ok") {
          setSucceeded(true);
        } else {
          if (result.formError) setFormError(result.formError);
          for (const [field, message] of Object.entries(
            result.fieldErrors ?? {},
          )) {
            form.setError(field as Path<TIn>, { message });
          }
        }
        resolve();
      }),
    );
  });

  return { onSubmit, pending, formError, succeeded };
}
