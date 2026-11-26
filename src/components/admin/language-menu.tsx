"use client";

import { CheckIcon, LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages } from "@/i18n/languages";
import { usePathname, useRouter } from "@/i18n/navigation";
import { rememberLocale } from "@/i18n/remember-locale";
import { routing, type Locale } from "@/i18n/routing";
import { saveUiLocale } from "@/lib/preferences/save-ui-locale";
import { AdminButton } from "./ui/button";

export function AdminLanguageMenu({ label }: { label: string }) {
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AdminButton variant="ghost" size="sm" className="gap-1.5 px-2">
          <LanguagesIcon aria-hidden />
          <span>{languages[current].shortCode}</span>
          <span className="sr-only">, {label}</span>
        </AdminButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            lang={l}
            onSelect={() => {
              rememberLocale(l);
              startTransition(async () => {
                await saveUiLocale(l);
                router.push(pathname, { locale: l });
              });
            }}
          >
            <span className="flex-1">{languages[l].nativeName}</span>
            {l === current ? <CheckIcon aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
