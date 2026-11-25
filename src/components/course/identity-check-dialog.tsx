"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/navigation";
import { answerIdentityCheck } from "@/lib/portal/identity-actions";

export type IdentityCheck = {
  questionKey: "dob" | "license_no_last4" | "security_question";
  prompt: string;
};

/**
 * A modal the Student cannot dismiss: progress is blocked in the database
 * until the check is answered correctly. Two wrong answers in a row pause
 * the enrollment.
 */
export function IdentityCheckDialog({
  enrollmentId,
  check,
}: {
  enrollmentId: string;
  check: IdentityCheck;
}) {
  const t = useTranslations("IdentityCheck");
  const tDetails = useTranslations("DriverDetails");
  const router = useRouter();
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busy, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [check.questionKey]);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const res = await answerIdentityCheck({
        enrollmentId,
        questionKey: check.questionKey,
        answer: value,
      });
      if (!res.ok) {
        setFailed(true);
        return;
      }
      setFailed(false);
      setValue("");
      if (res.paused) setPaused(true);
      else if (res.correct) router.refresh();
      else {
        setWrong(true);
        router.refresh();
      }
    });
  }

  const label =
    check.questionKey === "dob"
      ? t("dob")
      : check.questionKey === "license_no_last4"
        ? t("licenseLast4")
        : tDetails(`questions.${check.prompt}` as "questions.first_car");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="identity-title"
        className="w-full max-w-md space-y-4 rounded-lg border bg-background p-6 shadow-lg"
      >
        <h2 id="identity-title" className="text-lg font-semibold">
          {paused ? t("pausedTitle") : t("title")}
        </h2>
        {paused ? (
          <>
            <p className="text-sm">{t("paused")}</p>
            <Button asChild>
              <Link href="/contact">{t("contact")}</Link>
            </Button>
          </>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("intro")}</p>
            {wrong ? (
              <p role="alert" className="text-sm text-destructive">
                {t("wrong")}
              </p>
            ) : null}
            {failed ? (
              <p role="alert" className="text-sm text-destructive">
                {t("error")}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="identity-answer">{label}</Label>
              <Input
                id="identity-answer"
                ref={inputRef}
                type={check.questionKey === "dob" ? "date" : "text"}
                maxLength={check.questionKey === "license_no_last4" ? 4 : 200}
                autoComplete="off"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={busy || !value.trim()}>
              {t("submit")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
