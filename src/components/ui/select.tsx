import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControlClass } from "./input";

/** A native select with the reference field look and chevron. */
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        fieldControlClass, // `:read-only` always matches a select; keep the normal field look.
        "lms-select h-[52px] pr-11 read-only:border-solid read-only:bg-card read-only:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
