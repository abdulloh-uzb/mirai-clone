import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControlClass } from "./input";

/** A textarea with the reference field look. */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldControlClass,
        "min-h-28 resize-y py-3 leading-normal",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
