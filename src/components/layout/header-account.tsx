import { getTranslations } from "next-intl/server";
import { getCurrentAccount, initialsOf } from "@/lib/auth/current-account";
import { Link } from "@/i18n/navigation";
import { UserMenu } from "./user-menu";

/** "Sign in" and "Create account" for a Visitor, the user menu for a signed-in user. */
export async function HeaderAccount() {
  const account = await getCurrentAccount();
  const t = await getTranslations("Account");

  if (account) {
    return (
      <UserMenu
        initials={initialsOf(account)}
        firstName={account.firstName}
        isAdmin={account.role === "admin"}
      />
    );
  }

  return (
    <>
      <Link className="signin" href="/login">
        <span className="si-ic" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8.5" r="3.8"></circle>
            <path d="M4.8 20c1.2-3.6 4-5.4 7.2-5.4s6 1.8 7.2 5.4"></path>
          </svg>
        </span>
        <span>{t("signIn")}</span>
      </Link>
      <Link className="btn btn-primary btn-sm hdr-account" href="/signup">
        <span className="hc-ca">{t("createAccount")}</span>
      </Link>
    </>
  );
}
