import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/auth-card";
import { EmailLinkForm } from "@/components/auth/email-link-form";
import { Link } from "@/i18n/navigation";
import { authPageMetadata } from "../metadata";

export function generateMetadata({
  params,
}: PageProps<"/[locale]/reset-password">) {
  return authPageMetadata(params, "resetRequest");
}

export default function ResetPasswordPage() {
  const t = useTranslations("Auth.resetRequest");
  return (
    <AuthCard
      title={t("title")}
      intro={t("intro")}
      footer={
        <Link href="/login" className="font-medium text-link underline">
          {t("backToSignIn")}
        </Link>
      }
    >
      <EmailLinkForm kind="resetRequest" />
    </AuthCard>
  );
}
