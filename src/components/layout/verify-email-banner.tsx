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
      <div className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-dashed border-primary bg-blue-tint px-4 py-3.5 text-foreground sm:flex-row sm:items-center sm:px-5">
        <MailWarningIcon
          aria-hidden
          className="hidden size-[22px] shrink-0 text-blue-text sm:block"
        />
        <div className="flex-1">
          <h2 id="verify-email-title" className="font-extrabold">
            {t("title")}
          </h2>
          <p className="text-[15px]">{t("body", { email: account.email })}</p>
        </div>
        <ResendVerificationButton />
      </div>
    </section>
  );
}
