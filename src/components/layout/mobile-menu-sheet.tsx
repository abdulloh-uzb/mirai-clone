"use client";

import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { MobileMenuTrigger } from "./mobile-menu-trigger";
import { mainNav } from "./nav-links";

export function MobileMenuSheet({ label }: { label: string }) {
  const t = useTranslations("Header");
  // Mounted by the tap that asked for it, so it starts open.
  const [open, setOpen] = useState(true);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MobileMenuTrigger label={label} />
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
      >
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle>{t("menuTitle")}</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label={t("closeMenu")}>
              <XIcon aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>
        <nav aria-label={t("mainNav")} className="px-4">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
