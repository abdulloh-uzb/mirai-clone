"use client";

import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/** The signed-in user's header button. Shared by the server-rendered shell and the lazy menu. */
export function UserMenuTrigger({
  initials,
  firstName,
  ...props
}: ComponentProps<typeof Button> & { initials: string; firstName: string }) {
  return (
    <Button variant="ghost" className="gap-2 px-2" {...props}>
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
  );
}
