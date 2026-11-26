"use client";

import { MenuIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** The phone menu button. Shared by the server-rendered shell and the lazy sheet. */
export function MobileMenuTrigger({
  label,
  ...props
}: ComponentProps<typeof Button> & { label: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden"
      aria-label={label}
      {...props}
    >
      <MenuIcon aria-hidden />
    </Button>
  );
}
