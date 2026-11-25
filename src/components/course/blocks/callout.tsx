import { InfoIcon, LightbulbIcon, TriangleAlertIcon } from "lucide-react";
import { Markdown } from "@/components/content/markdown";
import { cn } from "@/lib/utils";

const TONES = {
  info: { icon: InfoIcon, classes: "border-primary/40 bg-primary/10" },
  tip: {
    icon: LightbulbIcon,
    classes: "border-brand-green/40 bg-brand-green/10",
  },
  warning: {
    icon: TriangleAlertIcon,
    classes: "border-amber-500/50 bg-amber-500/10",
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
  const { icon: Icon, classes } = TONES[tone];
  return (
    <aside className={cn("rounded-xl border p-4", classes)}>
      <p className="flex items-center gap-2 font-semibold">
        <Icon className="size-5 shrink-0" aria-hidden />
        {title}
      </p>
      <Markdown className="mt-2 text-sm">{markdown}</Markdown>
    </aside>
  );
}
