"use client";

import { ChevronDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth/actions";
import { Link } from "@/i18n/navigation";

// Portal pages arrive in later tickets; until then these fall through to the 404.
const items = [
  { key: "myCourses", href: "/portal" },
  { key: "myCertificates", href: "/portal/certificates" },
  { key: "myProfile", href: "/portal/profile" },
] as const;

export function UserMenu({
  initials,
  firstName,
}: {
  initials: string;
  firstName: string;
}) {
  const t = useTranslations("Account");
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 px-2">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
          >
            {initials}
          </span>
          <span className="max-w-32 truncate max-sm:sr-only">{firstName}</span>
          <ChevronDownIcon
            aria-hidden
            className="text-muted-foreground max-sm:hidden"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label={t("menuLabel")}>
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
