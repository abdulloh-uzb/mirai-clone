"use client";

import { usePathname } from "@/i18n/navigation";
import { AdminBreadcrumb } from "./breadcrumb";
import { buildCrumbs, type CrumbLabels } from "./nav";

/** Crumbs derived from the current path; labels come from the server. */
export function PathBreadcrumb({
  labels,
  ariaLabel,
}: {
  labels: CrumbLabels;
  ariaLabel: string;
}) {
  return (
    <AdminBreadcrumb
      items={buildCrumbs(usePathname(), labels)}
      label={ariaLabel}
    />
  );
}
