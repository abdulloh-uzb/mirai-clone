import { UserPlusIcon } from "lucide-react";
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
      {/* Icon-only on phones so the header fits 375 px; the label stays for screen readers. */}
      <Button asChild size="sm" className="max-sm:size-9 max-sm:px-0">
        <Link href="/signup">
          <UserPlusIcon aria-hidden className="sm:hidden" />
          <span className="max-sm:sr-only">{t("createAccount")}</span>
        </Link>
      </Button>
    </>
  );
}
