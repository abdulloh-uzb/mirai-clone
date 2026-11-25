import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { FormAlert } from "@/components/auth/form-parts";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Link } from "@/i18n/navigation";
import { authPageMetadata } from "../metadata";

export function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  return authPageMetadata(params, "signIn");
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/[locale]/login">) {
  const { error, next } = await searchParams;
  const t = await getTranslations("Auth.signIn");

  return (
    <AuthCard
      title={t("title")}
      intro={t("intro")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-medium text-primary underline">
            {t("signUpLink")}
          </Link>
        </>
      }
    >
      {error === "link" && (
        <div className="mb-4">
          <FormAlert tone="error">{t("linkError")}</FormAlert>
        </div>
      )}
      <SignInForm next={typeof next === "string" ? next : undefined} />
    </AuthCard>
  );
}
