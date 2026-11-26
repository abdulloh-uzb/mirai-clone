"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import {
  ErrorText,
  FormAlert,
  FormErrorAlert,
  Honeypot,
  SubmitButton,
  TextareaField,
  TextField,
  usePublicForm,
} from "@/components/forms/parts";
import { Label } from "@/components/ui/label";
import { submitBugReport } from "@/lib/support/actions";
import {
  bugReportSchema,
  HONEYPOT_FIELD,
  screenshotError,
  SCREENSHOT_TYPES,
} from "@/lib/validation/support";

export function BugReportForm({ accountEmail }: { accountEmail?: string }) {
  const t = useTranslations("BugReport");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotKey, setScreenshotKey] = useState<string | undefined>();
  const form = useForm<
    z.input<typeof bugReportSchema>,
    unknown,
    z.output<typeof bugReportSchema>
  >({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      whatHappened: "",
      email: accountEmail ?? "",
      pageUrl: window.location.href,
    },
  });
  const { onSubmit, pending, formError, succeeded } = usePublicForm(
    form,
    (values, honeypot, locale) => {
      const data = new FormData();
      data.set("whatHappened", values.whatHappened);
      data.set("email", values.email);
      data.set("pageUrl", values.pageUrl);
      data.set(HONEYPOT_FIELD, honeypot);
      if (screenshot) data.set("screenshot", screenshot);
      return submitBugReport(data, locale);
    },
  );
  const { errors } = form.formState;
  // The server can also reject the file; that error is set on a field the
  // form does not register, so read it loosely.
  const serverScreenshotError = (
    errors as Record<string, { message?: string } | undefined>
  ).screenshot?.message;

  if (succeeded) return <FormAlert tone="success">{t("success")}</FormAlert>;

  return (
    <form
      onSubmit={(event) => {
        if (screenshotKey) {
          event.preventDefault();
          return;
        }
        return onSubmit(event);
      }}
      noValidate
      className="relative grid gap-4"
    >
      <FormErrorAlert error={formError} />
      <TextareaField
        id="bug-what"
        label={t("whatHappened")}
        error={errors.whatHappened?.message}
        {...form.register("whatHappened")}
      />
      <TextField
        id="bug-page"
        label={t("pageUrl")}
        readOnly
        error={errors.pageUrl?.message}
        {...form.register("pageUrl")}
      />
      <TextField
        id="bug-email"
        type="email"
        label={t("email")}
        autoComplete="email"
        readOnly={accountEmail !== undefined}
        error={errors.email?.message}
        {...form.register("email")}
      />
      <div className="grid gap-2">
        <Label htmlFor="bug-screenshot">{t("screenshot")}</Label>
        <input
          id="bug-screenshot"
          type="file"
          accept={SCREENSHOT_TYPES.join(",")}
          aria-describedby="bug-screenshot-hint bug-screenshot-error"
          className="text-sm file:mr-3 file:rounded-md file:border file:bg-secondary file:px-3 file:py-1.5 file:text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setScreenshot(file);
            setScreenshotKey(
              file ? (screenshotError(file) ?? undefined) : undefined,
            );
          }}
        />
        <p id="bug-screenshot-hint" className="text-sm text-muted-foreground">
          {t("screenshotHint")}
        </p>
        <ErrorText
          id="bug-screenshot-error"
          error={screenshotKey ?? serverScreenshotError}
        />
      </div>
      <Honeypot />
      <SubmitButton pending={pending}>{t("submit")}</SubmitButton>
    </form>
  );
}
