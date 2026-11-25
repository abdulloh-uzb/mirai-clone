import { getTranslations } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { NewPasswordForm } from "@/components/auth/new-password-form";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { Link } from "@/i18n/navigation";
import { authPageMetadata } from "../../metadata";

export function generateMetadata({
  params,
}: PageProps<"/[locale]/reset-password/update">) {
  return authPageMetadata(params, "resetUpdate");
}

// The reset email link signs the Student in (via /api/auth/callback) and
// lands here, so a session is required to set the new password.
export default async function NewPasswordPage() {
  const t = await getTranslations("Auth.resetUpdate");
  const account = await getCurrentAccount();

  return (
    <AuthCard title={t("title")}>
      {account ? (
        <NewPasswordForm />
      ) : (
        <div className="grid gap-4">
          <p>{t("needsLink")}</p>
          <Link
            href="/reset-password"
            className="font-medium text-primary underline"
          >
            {t("requestLink")}
          </Link>
        </div>
      )}
    </AuthCard>
  );
}
