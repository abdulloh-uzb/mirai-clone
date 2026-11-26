import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The reference `.notice` box: an icon and text on a tinted card. `warning` is
 * the dashed `.notice-warn`; `error` and `success` use the alert and green tints.
 * Pass `role` ("status" or "alert") and any data attributes as usual.
 */
const noticeVariants = cva(
  "flex items-start gap-3 rounded-[18px] border-[1.5px] px-4 py-3.5 text-[16px] leading-normal text-foreground sm:px-[18px] sm:py-4 sm:text-[17px] [&_b]:font-extrabold [&_strong]:font-extrabold",
  {
    variants: {
      tone: {
        info: "border-line-blue bg-hero",
        warning: "border-dashed border-primary bg-blue-tint",
        error: "border-alert-line bg-alert-bg",
        success:
          "border-[color-mix(in_srgb,var(--logo-green)_70%,var(--card))] bg-green-tint",
      },
    },
    defaultVariants: { tone: "info" },
  },
);

const ICONS: Record<
  NonNullable<VariantProps<typeof noticeVariants>["tone"]>,
  { icon: LucideIcon; className: string }
> = {
  info: { icon: InfoIcon, className: "text-blue-text" },
  warning: { icon: TriangleAlertIcon, className: "text-blue-text" },
  error: { icon: CircleAlertIcon, className: "text-alert" },
  success: { icon: CircleCheckIcon, className: "text-green-ink" },
};

function Notice({
  className,
  tone,
  icon = true,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof noticeVariants> & {
    /** Set false to leave out the leading icon. */
    icon?: boolean;
  }) {
  const { icon: Icon, className: iconClass } = ICONS[tone ?? "info"];
  return (
    <div
      data-slot="notice"
      className={cn(noticeVariants({ tone }), className)}
      {...props}
    >
      {icon ? (
        <Icon
          aria-hidden
          className={cn("mt-0.5 size-[22px] shrink-0", iconClass)}
        />
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export { Notice, noticeVariants };
