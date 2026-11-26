import { useTranslations } from "next-intl";
import type { StudentStage } from "@/lib/admin/stages";
import { AdminBadge, type AdminBadgeTone } from "./ui/badge";

const TONE: Record<StudentStage, AdminBadgeTone> = {
  registered: "neutral",
  studying: "info",
  needs_attention: "warning",
  completed: "success",
  reported: "done",
};

export function StageBadge({ stage }: { stage: StudentStage }) {
  const t = useTranslations("Admin.stages");
  return <AdminBadge tone={TONE[stage]}>{t(stage)}</AdminBadge>;
}
