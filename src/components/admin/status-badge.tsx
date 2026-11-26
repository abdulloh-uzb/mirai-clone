import { useTranslations } from "next-intl";
import { AdminBadge, type AdminBadgeTone } from "@/components/admin/ui/badge";

const TONE: Record<string, AdminBadgeTone> = {
  active: "info",
  paused: "warning",
  locked: "danger",
  expired: "danger",
  completed: "success",
  refunded: "neutral",
  partially_refunded: "neutral",
  pending: "warning",
  paid: "success",
  failed: "danger",
  requested: "warning",
  approved: "info",
  rejected: "danger",
  processed: "success",
  queued: "neutral",
  sent: "info",
  accepted: "done",
  error: "danger",
  open: "warning",
  in_progress: "info",
  closed: "neutral",
};

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const t = useTranslations("Admin.statuses");
  return (
    <AdminBadge tone={TONE[status] ?? "neutral"}>
      {label ??
        (t.has(status as never)
          ? t(status as never)
          : status.replaceAll("_", " "))}
    </AdminBadge>
  );
}
