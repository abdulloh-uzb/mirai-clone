import { MailWarningIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { ResendVerificationButton } from "./resend-verification-button";

/** Shown to signed-in Students whose email is not verified yet. */
export async function VerifyEmailBanner() {
  const account = await getCurrentAccount();
  if (!account || account.emailVerified) return null;
  const t = await getTranslations("VerifyEmail");

  return (
    <section
      aria-labelledby="verify-email-title"
      className="mx-auto mt-3 w-full max-w-6xl px-3"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-amber-950 sm:flex-row sm:items-center dark:bg-amber-950/40 dark:text-amber-50">
        <MailWarningIcon
          aria-hidden
          className="hidden size-5 shrink-0 sm:block"
        />
        <div className="flex-1">
          <h2 id="verify-email-title" className="font-semibold">
            {t("title")}
          </h2>
          <p className="text-sm">{t("body", { email: account.email })}</p>
        </div>
        <ResendVerificationButton />
      </div>
    </section>
  );
}
