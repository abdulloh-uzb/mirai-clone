"use client";

import { ArrowLeftIcon, ChevronDownIcon, LogOutIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { signOut } from "@/lib/auth/actions";
import { AdminButton } from "./ui/button";

export function AdminAccountMenu({
  firstName,
  initials,
  name,
  email,
  labels,
}: {
  firstName: string;
  initials: string;
  name: string;
  email: string;
  labels: { menu: string; backToSite: string; signOut: string };
}) {
  const locale = useLocale() as Locale;
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AdminButton variant="ghost" size="sm" className="gap-2 px-1.5">
          <span
            aria-hidden
            className="grid size-6 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
          >
            {initials}
          </span>
          <span className="max-w-28 truncate max-sm:sr-only">{firstName}</span>
          <ChevronDownIcon
            aria-hidden
            className="size-3.5 text-muted-foreground max-sm:hidden"
          />
        </AdminButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        aria-label={labels.menu}
        className="w-56"
      >
        <DropdownMenuLabel>
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/">
            <ArrowLeftIcon />
            {labels.backToSite}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={pending}
          onSelect={() => startTransition(() => signOut(locale))}
        >
          <LogOutIcon />
          {labels.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
