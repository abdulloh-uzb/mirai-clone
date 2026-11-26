import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Reference status pills: tinted chips with bold text, plus the green `.pill-green`. */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-2.5 py-0.5 text-[13px] leading-snug font-extrabold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-line-blue bg-hero text-foreground",
        info: "border-primary/60 bg-blue-tint text-foreground",
        success:
          "border-[color-mix(in_srgb,var(--logo-green)_55%,var(--card))] bg-green-tint text-green-ink",
        warning: "border-dashed border-primary bg-blue-tint text-foreground",
        danger: "border-alert-line/60 bg-alert-bg text-alert",
        strong:
          "border-brand-green bg-brand-green tracking-[0.04em] text-[#0f1217] uppercase",
        dark: "border-foreground bg-foreground tracking-[0.06em] text-background",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
