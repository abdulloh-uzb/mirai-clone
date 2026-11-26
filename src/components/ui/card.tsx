import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Reference surfaces. `default` is the white card with a light-blue edge,
 * `tint` the pale-blue `.card`, and `panel` the `.panel` with a blue top and
 * green bottom stripe for the one thing a page is about.
 */
const cardVariants = cva("flex flex-col gap-3 text-card-foreground", {
  variants: {
    variant: {
      default: "rounded-[22px] border border-line-blue bg-card",
      tint: "rounded-[22px] border border-line-blue bg-hero",
      panel:
        "rounded-[22px] border-t-[6px] border-b-[6px] border-t-brand-sky border-b-brand-green bg-card shadow-panel",
      plain: "rounded-[22px] bg-surface",
    },
    padding: {
      default: "p-5 sm:p-6",
      sm: "p-4",
      lg: "p-6 sm:p-8",
      none: "",
    },
  },
  defaultVariants: { variant: "default", padding: "default" },
});

function Card({
  className,
  variant,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="card-title"
      className={cn(
        "text-[22px] leading-tight font-extrabold tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-[17px] text-muted-foreground", className)}
      {...props}
    />
  );
}

export { Card, CardTitle, CardDescription, cardVariants };
