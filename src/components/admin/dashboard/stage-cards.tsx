import {
  BadgeCheckIcon,
  BookOpenIcon,
  GraduationCapIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { STUDENT_STAGES, type StudentStage } from "@/lib/admin/stages";
import { cn } from "@/lib/utils";

const ICONS = {
  registered: UserPlusIcon,
  studying: BookOpenIcon,
  needs_attention: TriangleAlertIcon,
  completed: GraduationCapIcon,
  reported: BadgeCheckIcon,
} satisfies Record<StudentStage, unknown>;

export function StageCards({
  counts,
}: {
  counts: Record<StudentStage, number>;
}) {
  const t = useTranslations("Admin");
  return (
    <section aria-labelledby="dash-stages">
      <h2 id="dash-stages" className="mb-3 text-base font-semibold">
        {t("dashboard.stagesHeading")}
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STUDENT_STAGES.map((s) => {
          const Icon = ICONS[s];
          return (
            <li key={s}>
              <Link
                href={`/admin/students?stage=${s}`}
                className="flex h-full flex-col rounded-lg border bg-card p-4 shadow-xs transition-colors hover:border-primary/60 hover:bg-accent/40"
              >
                <span className="flex items-center justify-between gap-2 text-sm font-medium">
                  {t(`stages.${s}`)}
                  <Icon aria-hidden className="size-4 text-muted-foreground" />
                </span>
                <span
                  className={cn(
                    "mt-2 text-2xl font-semibold tabular-nums",
                    s === "needs_attention" &&
                      counts[s] > 0 &&
                      "text-amber-700 dark:text-amber-400",
                  )}
                >
                  {counts[s]}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {t(`stageHints.${s}`)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
