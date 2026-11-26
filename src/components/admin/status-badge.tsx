import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

type Tone = "success" | "warning" | "danger" | "neutral";

const TONES: Record<string, Tone> = {
  active: "success",
  completed: "success",
  paid: "success",
  processed: "success",
  paused: "warning",
  pending: "warning",
  requested: "warning",
  locked: "danger",
  expired: "danger",
  failed: "danger",
  rejected: "danger",
};

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslations("Admin.statuses");
  return (
    <Badge tone={TONES[status] ?? "neutral"}>
      {t.has(status as never)
        ? t(status as never)
        : status.replaceAll("_", " ")}
    </Badge>
  );
}
