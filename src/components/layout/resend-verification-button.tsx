"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resendVerificationEmail } from "@/lib/auth/actions";

export function ResendVerificationButton() {
  const t = useTranslations("VerifyEmail");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"sent" | "failed" | null>(null);

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const outcome = await resendVerificationEmail(locale);
            setResult(outcome.status === "sent" ? "sent" : "failed");
          })
        }
      >
        {pending ? t("sending") : t("resend")}
      </Button>
      <p role="status" className="text-sm">
        {result && t(result)}
      </p>
    </div>
  );
}
