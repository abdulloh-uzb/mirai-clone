import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { getCurrentAccount, initialsOf } from "@/lib/auth/current-account";
import { Link } from "@/i18n/navigation";
import { UserMenu } from "./user-menu";

/** "Create account" for a Visitor, the user menu for a signed-in user. */
export async function HeaderAccount() {
  const account = await getCurrentAccount();
  const t = await getTranslations("Account");

  if (account) {
    return (
      <UserMenu initials={initialsOf(account)} firstName={account.firstName} />
    );
  }

  return (
    <>
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="hidden sm:inline-flex"
      >
        <Link href="/login">{t("signIn")}</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">{t("createAccount")}</Link>
      </Button>
    </>
  );
}
