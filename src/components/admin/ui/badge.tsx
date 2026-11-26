import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const adminBadgeVariants = cva(
  "inline-flex w-fit items-center gap-1 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-foreground",
        info: "bg-sky-50 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
        success:
          "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
        warning:
          "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
        danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200",
        done: "bg-emerald-700 text-white",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type AdminBadgeTone = NonNullable<
  VariantProps<typeof adminBadgeVariants>["tone"]
>;

export function AdminBadge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof adminBadgeVariants>) {
  return (
    <span
      data-slot="admin-badge"
      className={cn(adminBadgeVariants({ tone }), className)}
      {...props}
    />
  );
}
