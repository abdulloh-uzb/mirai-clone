"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AdminButton } from "./ui/button";

/** The sidebar in a slide-over for screens narrower than `lg`. */
export function AdminMobileNav({
  openLabel,
  title,
  children,
}: {
  openLabel: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <AdminButton
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label={openLabel}
        >
          <MenuIcon aria-hidden />
        </AdminButton>
      </SheetTrigger>
      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="w-72 max-w-[85vw] gap-0 bg-sidebar p-0 sm:max-w-72"
        onClickCapture={(e) => {
          if (e.target instanceof Element && e.target.closest("a[href]")) {
            setOpen(false);
          }
        }}
      >
        <SheetTitle className="sr-only">{title}</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}
