import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Link } from "@/i18n/navigation";
import { authPageMetadata } from "../metadata";

export function generateMetadata({ params }: PageProps<"/[locale]/signup">) {
  return authPageMetadata(params, "signUp");
}

export default function SignUpPage() {
  const t = useTranslations("Auth.signUp");
  return (
    <AuthCard
      title={t("title")}
      intro={t("intro")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary underline">
            {t("signInLink")}
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
