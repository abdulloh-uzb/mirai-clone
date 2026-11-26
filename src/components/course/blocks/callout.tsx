import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import { Markdown } from "@/components/content/markdown";
import { cn } from "@/lib/utils";

// Reference `.notice` tones: blue info, green tip, dashed blue warning.
const TONES = {
  info: {
    icon: InfoIcon,
    classes: "border-line-blue bg-hero",
    iconClass: "bg-card text-blue-text",
  },
  tip: {
    icon: LightbulbIcon,
    classes:
      "border-[color-mix(in_srgb,var(--logo-green)_70%,var(--card))] bg-green-tint",
    iconClass: "bg-brand-green text-[#0f1217]",
  },
  warning: {
    icon: TriangleAlertIcon,
    classes: "border-dashed border-primary bg-blue-tint",
    iconClass: "bg-primary text-[#0f1217]",
  },
} as const;

export function CalloutBlock({
  tone,
  title,
  markdown,
}: {
  tone: keyof typeof TONES;
  title: string;
  markdown: string;
}) {
  const { icon: Icon, classes, iconClass } = TONES[tone];
  return (
    <aside className={cn("rounded-[22px] border-[1.5px] p-5 sm:p-6", classes)}>
      <p className="flex items-center gap-3 text-lg font-extrabold tracking-tight">
        <span
          aria-hidden
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full",
            iconClass,
          )}
        >
          <Icon className="size-[18px]" />
        </span>
        {title}
      </p>
      <Markdown className="mt-1 text-[17px] [&>*:first-child]:mt-2">
        {markdown}
      </Markdown>
    </aside>
  );
}
