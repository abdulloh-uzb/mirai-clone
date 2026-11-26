import { LmsBody, LmsHero } from "@/components/layout/lms-page";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PrivacyChoicesButton } from "@/components/privacy/cookie-consent";
import { Button, buttonVariants } from "@/components/ui/button";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { requestAccountDeletion } from "@/lib/privacy/actions";
import { createServiceClient } from "@/lib/supabase/service";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Privacy" });
  return { title: t("title") };
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/portal/privacy">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const account = await getCurrentAccount();
  if (!account) notFound();
  const t = await getTranslations({ locale, namespace: "Privacy" });

  const { data: pending } = await createServiceClient()
    .from("tickets")
    .select("id")
    .eq("user_id", account.userId)
    .eq("status", "open")
    .contains("details", { kind: "deletion_request" })
    .limit(1);

  return (
    <>
      <LmsHero title={t("title")} />
      <LmsBody className="grid max-w-4xl gap-6">
        <div className="grid gap-3 rounded-[22px] border border-line-blue bg-card p-6 sm:p-8">
          <h2 className="text-[22px] font-extrabold tracking-tight">
            {t("exportHeading")}
          </h2>
          <p className="text-muted-foreground">{t("exportBody")}</p>
          <Button asChild className="justify-self-start">
            <a href="/api/portal/export" download="my-data.json">
              {t("exportButton")}
            </a>
          </Button>
        </div>

        <div className="grid gap-3 rounded-[22px] border border-line-blue bg-card p-6 sm:p-8">
          <h2 className="text-[22px] font-extrabold tracking-tight">
            {t("deleteHeading")}
          </h2>
          <p className="text-muted-foreground">{t("deleteBody")}</p>
          {pending?.length ? (
            <p role="status" className="font-medium">
              {t("deletePending")}
            </p>
          ) : (
            <form action={requestAccountDeletion}>
              <Button type="submit" variant="outline">
                {t("deleteButton")}
              </Button>
            </form>
          )}
        </div>

        <div className="grid gap-3 rounded-[22px] border border-line-blue bg-card p-6 sm:p-8">
          <h2 className="text-[22px] font-extrabold tracking-tight">
            {t("cookiesHeading")}
          </h2>
          <p className="text-muted-foreground">{t("cookiesBody")}</p>
          <PrivacyChoicesButton
            className={buttonVariants({
              variant: "secondary",
              className: "justify-self-start",
            })}
          />
        </div>
      </LmsBody>
    </>
  );
}
