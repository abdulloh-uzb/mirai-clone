import * as React from "react";
import { cn } from "@/lib/utils";

/** Native checkbox/radio look in the Admin. */
export const adminCheckClass = "size-4 shrink-0 accent-primary";

/** A label above its control, with an optional hint below. */
export function AdminField({
  label,
  hint,
  className,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function AdminCheckboxField({
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { label: React.ReactNode }) {
  return (
    <label className={cn("flex items-center gap-2 text-sm", className)}>
      <input type="checkbox" className={adminCheckClass} {...props} />
      {label}
    </label>
  );
}
