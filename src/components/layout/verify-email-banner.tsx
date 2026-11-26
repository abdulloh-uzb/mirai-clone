import { MailWarningIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { DismissibleNotice } from "./dismissible-notice";
import { ResendVerificationButton } from "./resend-verification-button";

/** Shown to signed-in Students whose email is not verified yet. */
export async function VerifyEmailBanner() {
  const account = await getCurrentAccount();
  if (!account || account.emailVerified) return null;
  const t = await getTranslations("VerifyEmail");

  return (
    <section
      aria-labelledby="verify-email-title"
      // Floating card: the page heroes slide under the sticky header, so an
      // in-flow banner here would be covered by them.
      className="fixed bottom-[calc(16px+var(--consent-h,0px))] left-3 z-50 w-[min(440px,calc(100vw-24px))]"
    >
      <DismissibleNotice
        storageKey="verify-email-notice"
        closeLabel={t("close")}
      >
        <div className="flex flex-col gap-3 rounded-[18px] border-[1.5px] border-dashed border-primary bg-blue-tint py-3.5 pr-11 pl-4 text-foreground shadow-lg">
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
      </DismissibleNotice>
    </section>
  );
}
