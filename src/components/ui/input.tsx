import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The reference form field (`.mf input`): 2px outline border, 14px corners,
 * a sky-blue border and soft glow on focus. Shared by inputs, selects and
 * textareas so every form looks the same.
 */
export const fieldControlClass = cn(
  "w-full min-w-0 rounded-[14px] border-2 border-input bg-card px-4 text-[17px] text-foreground transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground",
  "focus-visible:border-primary focus-visible:shadow-[0_0_0_4px_#3fb9ff2e]",
  "aria-invalid:border-alert-line aria-invalid:focus-visible:shadow-[0_0_0_4px_#d6454526]",
  "disabled:cursor-not-allowed disabled:opacity-50 read-only:border-dashed read-only:bg-surface read-only:text-muted-foreground",
  "selection:bg-primary selection:text-primary-foreground",
);

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldControlClass,
        "h-[52px] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
