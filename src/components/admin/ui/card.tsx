import * as React from "react";
import { cn } from "@/lib/utils";

export function AdminCard({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="admin-card"
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

export function AdminCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export function AdminCardTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      className={cn("text-sm leading-none font-semibold", className)}
      {...props}
    />
  );
}

export function AdminCardDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function AdminCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}
