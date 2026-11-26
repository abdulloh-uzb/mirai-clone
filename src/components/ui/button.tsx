import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

/**
 * The reference pill button (`.btn`): 2px border, bold label, sky-blue primary
 * with a soft glow. Labels may wrap on narrow screens instead of overflowing.
 * Focus uses the global `:focus-visible` outline.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-transparent text-center leading-tight font-bold text-balance transition-[background-color,border-color,box-shadow,color] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-8px_var(--blue)] hover:border-blue-hover hover:bg-blue-hover",
        destructive:
          "border-destructive bg-destructive text-white hover:bg-destructive/90 dark:text-[#2a1418]",
        outline:
          "border-primary bg-transparent text-foreground hover:bg-primary/10 dark:border-[#3a6d8a]",
        secondary:
          "border-line-blue bg-hero text-foreground hover:bg-line-blue",
        ghost: "text-foreground hover:bg-blue-tint",
        link: "rounded-md border-0 px-0 text-blue-text underline underline-offset-3 hover:text-primary has-[>svg]:px-0",
      },
      size: {
        default: "min-h-11 px-5 py-1.5 text-base has-[>svg]:px-4",
        xs: "min-h-7 gap-1 px-2.5 text-xs has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-10 gap-1.5 px-4 py-1 text-[15px] has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-4",
        lg: "min-h-[52px] px-7 py-2 text-lg has-[>svg]:px-6",
        xl: "min-h-[60px] px-[34px] py-2.5 text-lg has-[>svg]:px-7",
        icon: "size-11",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
