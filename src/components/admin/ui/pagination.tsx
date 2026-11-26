import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminButtonVariants } from "./button";

export function AdminPagination({
  label,
  pageLabel,
  previousHref,
  nextHref,
  previousLabel,
  nextLabel,
}: {
  label: string;
  pageLabel: string;
  previousHref: string | null;
  nextHref: string | null;
  previousLabel: string;
  nextLabel: string;
}) {
  const cls = adminButtonVariants({ variant: "outline", size: "sm" });
  return (
    <nav
      aria-label={label}
      className="flex items-center justify-between gap-2 border-t px-4 py-2.5"
    >
      <p className="text-xs text-muted-foreground tabular-nums">{pageLabel}</p>
      <div className="flex items-center gap-2">
        {previousHref ? (
          <Link href={previousHref} className={cls}>
            <ChevronLeftIcon aria-hidden />
            {previousLabel}
          </Link>
        ) : (
          <span aria-disabled="true" className={cls}>
            <ChevronLeftIcon aria-hidden />
            {previousLabel}
          </span>
        )}
        {nextHref ? (
          <Link href={nextHref} className={cls}>
            {nextLabel}
            <ChevronRightIcon aria-hidden />
          </Link>
        ) : (
          <span aria-disabled="true" className={cls}>
            {nextLabel}
            <ChevronRightIcon aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
