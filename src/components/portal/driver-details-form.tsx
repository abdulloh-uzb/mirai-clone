"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  FormAlert,
  FormErrorAlert,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/forms/parts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { saveDriverDetails } from "@/lib/portal/details-actions";
import {
  makeDriverDetailsSchema,
  SECURITY_QUESTION_KEYS,
  type DriverDetails,
  type DriverDetailsInput,
} from "@/lib/validation/driver-details";
import type { FormErrorKey } from "@/lib/validation/support";

export type CountyOption = {
  slug: string;
  name: string;
  caseLookupUrl: string | null;
};

type Props = {
  enrollmentId: string;
  defaults: DriverDetailsInput;
  counties: CountyOption[];
  locked: boolean;
  hasSecurityAnswer: boolean;
  /** Already checked with `safeReturnPath`; a locale-less portal path. */
  nextPath: string;
};

export function DriverDetailsForm({
  enrollmentId,
  defaults,
  counties,
  locked,
  hasSecurityAnswer,
  nextPath,
}: Props) {
  const t = useTranslations("DriverDetails");
  const router = useRouter();
  const schema = useMemo(
    () =>
      makeDriverDetailsSchema({ requireSecurityAnswer: !hasSecurityAnswer }),
    [hasSecurityAnswer],
  );
  const form = useForm<DriverDetailsInput, unknown, DriverDetails>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const { errors } = form.formState;
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<FormErrorKey | null>(null);
  const [saved, setSaved] = useState(false);
  const countySlug = useWatch({ control: form.control, name: "countySlug" });
  const lookupUrl = counties.find((c) => c.slug === countySlug)?.caseLookupUrl;

  const onSubmit = form.handleSubmit(
    (values) =>
      new Promise<void>((resolve) =>
        startTransition(async () => {
          setFormError(null);
          const result = await saveDriverDetails(enrollmentId, values);
          if (result.status === "ok") {
            setSaved(true);
            router.push(nextPath);
          } else {
            if (result.formError) setFormError(result.formError);
            for (const [field, message] of Object.entries(
              result.fieldErrors ?? {},
            )) {
              form.setError(field as keyof DriverDetailsInput, { message });
            }
          }
          resolve();
        }),
      ),
  );

  const lockedHint = locked ? t("lockedNote") : undefined;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FormErrorAlert error={formError} />
      <TextField
        id="dd-legal-name"
        label={t("legalName")}
        hint={lockedHint ?? t("legalNameHint")}
        autoComplete="name"
        readOnly={locked}
        error={errors.legalName?.message}
        {...form.register("legalName")}
      />
      <TextField
        id="dd-dob"
        type="date"
        label={t("dob")}
        hint={lockedHint ?? t("dobHint")}
        autoComplete="bday"
        readOnly={locked}
        error={errors.dob?.message}
        {...form.register("dob")}
      />
      <TextField
        id="dd-license-state"
        label={t("licenseState")}
        maxLength={2}
        readOnly={locked}
        error={errors.licenseState?.message}
        {...form.register("licenseState")}
      />
      <TextField
        id="dd-license-no"
        label={t("licenseNo")}
        hint={lockedHint}
        autoComplete="off"
        readOnly={locked}
        error={errors.licenseNo?.message}
        {...form.register("licenseNo")}
      />
      <TextField
        id="dd-phone"
        type="tel"
        label={t("phone")}
        autoComplete="tel"
        error={errors.phone?.message}
        {...form.register("phone")}
      />
      <SelectField
        id="dd-county"
        label={t("county")}
        error={errors.countySlug?.message}
        {...form.register("countySlug")}
      >
        <option value="">{t("countyPlaceholder")}</option>
        {counties.map((county) => (
          <option key={county.slug} value={county.slug}>
            {county.name}
          </option>
        ))}
      </SelectField>
      <TextField
        id="dd-citation"
        label={t("citation")}
        autoComplete="off"
        error={errors.citationNo?.message}
        {...form.register("citationNo")}
      />
      <WhereDialog lookupUrl={lookupUrl ?? null} />
      <TextField
        id="dd-due-date"
        type="date"
        label={t("dueDate")}
        error={errors.courtDueDate?.message}
        {...form.register("courtDueDate")}
      />
      <SelectField
        id="dd-security-question"
        label={t("securityQuestion")}
        error={errors.securityQuestion?.message}
        {...form.register("securityQuestion")}
      >
        {SECURITY_QUESTION_KEYS.map((key) => (
          <option key={key} value={key}>
            {t(`questions.${key}`)}
          </option>
        ))}
      </SelectField>
      <TextField
        id="dd-security-answer"
        label={t("securityAnswer")}
        hint={hasSecurityAnswer ? t("securityAnswerKeep") : undefined}
        autoComplete="off"
        error={errors.securityAnswer?.message}
        {...form.register("securityAnswer")}
      />
      {saved ? <FormAlert tone="success">{t("saved")}</FormAlert> : null}
      <SubmitButton pending={pending}>
        {pending ? t("saving") : t("save")}
      </SubmitButton>
    </form>
  );
}

function WhereDialog({ lookupUrl }: { lookupUrl: string | null }) {
  const t = useTranslations("DriverDetails");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="link"
          className="justify-self-start px-0"
        >
          {t("whereButton")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={t("close")}>
        <DialogHeader>
          <DialogTitle>{t("whereTitle")}</DialogTitle>
          <DialogDescription>{t("whereBody")}</DialogDescription>
        </DialogHeader>
        <Image
          src="/placeholder/sample-citation.svg"
          alt={t("whereAlt")}
          width={480}
          height={300}
          className="h-auto w-full rounded-md border"
        />
        {lookupUrl ? (
          <a
            href={lookupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline"
          >
            {t("caseLookup")}
          </a>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
