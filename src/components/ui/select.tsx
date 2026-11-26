import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControlClass } from "./input";

/** A native select with the reference field look and chevron. */
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(fieldControlClass, "lms-select h-[52px] pr-11", className)}
      {...props}
    />
  );
}

export { Select };
