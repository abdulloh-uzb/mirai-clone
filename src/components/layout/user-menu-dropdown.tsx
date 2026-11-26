"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { Link } from "@/i18n/navigation";
import { UserMenuTrigger } from "./user-menu-trigger";

// The Portal exists (an empty placeholder); its certificates and profile pages
// arrive in later phases and fall through to the 404 until then.
const items = [
  { key: "myCourses", href: "/portal" },
  { key: "myCertificates", href: "/portal/certificates" },
  { key: "myProfile", href: "/portal/profile" },
] as const;

export function UserMenuDropdown({
  initials,
  firstName,
  isAdmin = false,
}: {
  initials: string;
  firstName: string;
  isAdmin?: boolean;
}) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger asChild>
        <UserMenuTrigger initials={initials} firstName={firstName} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label={t("menuLabel")}>
        {isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/admin">{t("adminPanel")}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <Link href={item.href}>{t(item.key)}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending}
          onSelect={() => startTransition(() => signOut(locale))}
        >
          {t("logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
