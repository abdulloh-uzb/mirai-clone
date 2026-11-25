import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { EmailLinkForm } from "@/components/auth/email-link-form";
import { Link } from "@/i18n/navigation";
import { authPageMetadata } from "../../metadata";

export function generateMetadata({
  params,
}: PageProps<"/[locale]/login/magic-link">) {
  return authPageMetadata(params, "magicLink");
}

export default async function MagicLinkPage({
  searchParams,
}: PageProps<"/[locale]/login/magic-link">) {
  const { next } = await searchParams;
  const t = await getTranslations("Auth.magicLink");
  return (
    <AuthCard
      title={t("title")}
      intro={t("intro")}
      footer={
        <Link href="/login" className="font-medium text-primary underline">
          {t("backToSignIn")}
        </Link>
      }
    >
      <EmailLinkForm
        kind="magicLink"
        next={typeof next === "string" ? next : undefined}
      />
    </AuthCard>
  );
}
