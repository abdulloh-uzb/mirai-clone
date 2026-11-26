import {
  CalendarClockIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  LifeBuoyIcon,
  ShieldAlertIcon,
  TriangleAlertIcon,
  Undo2Icon,
} from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatUsd } from "@/lib/courses/courses";
import {
  attentionHref,
  attentionViewAllHref,
  ticketTypeOf,
  type AttentionKind,
  type AttentionRow,
} from "@/lib/admin/dashboard-view";
import { AdminBadge } from "../ui/badge";
import {
  AdminCard,
  AdminCardContent,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
} from "../ui/card";

const ICONS = {
  report_failed: ShieldAlertIcon,
  refund_requested: Undo2Icon,
  enrollment_blocked: TriangleAlertIcon,
  ticket_open: LifeBuoyIcon,
  court_due_soon: CalendarClockIcon,
} satisfies Record<AttentionKind, unknown>;

export async function AttentionList({
  locale,
  groups,
  now,
}: {
  locale: Locale;
  groups: { kind: AttentionKind; total: number; items: AttentionRow[] }[];
  now: Date;
}) {
  const [t, tTickets, format] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    getTranslations({ locale, namespace: "Admin.tickets" }),
    getFormatter({ locale }),
  ]);

  function what(kind: AttentionKind, row: AttentionRow): string {
    switch (kind) {
      case "report_failed":
        return row.detail === "rejected"
          ? t("dashboard.attentionRows.reportRejected")
          : t("dashboard.attentionRows.reportError");
      case "refund_requested":
        return t("dashboard.attentionRows.refund", {
          amount: formatUsd(row.amount_cents ?? 0, locale),
        });
      case "enrollment_blocked":
        return row.detail === "paused"
          ? t("dashboard.attentionRows.paused")
          : row.detail === "locked"
            ? t("dashboard.attentionRows.locked")
            : t("dashboard.attentionRows.expired");
      case "ticket_open": {
        const type = ticketTypeOf(row.detail);
        return t("dashboard.attentionRows.ticket", {
          type: type ? tTickets(`types.${type}`) : row.detail,
        });
      }
      case "court_due_soon":
        return t("dashboard.attentionRows.courtDue", {
          date: format.dateTime(new Date(`${row.due_date}T00:00:00Z`), {
            dateStyle: "medium",
            timeZone: "UTC",
          }),
        });
    }
  }

  return (
    <AdminCard>
      <AdminCardHeader>
        <div>
          <AdminCardTitle>{t("dashboard.attentionHeading")}</AdminCardTitle>
          <AdminCardDescription>
            {t("dashboard.attentionDescription")}
          </AdminCardDescription>
        </div>
      </AdminCardHeader>
      <AdminCardContent className="flex flex-col gap-5">
        {groups.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <CircleCheckIcon aria-hidden className="size-4 text-emerald-600" />
            {t("dashboard.attentionEmpty")}
          </p>
        ) : null}
        {groups.map(({ kind, total, items }) => {
          const KindIcon = ICONS[kind];
          const viewAll = attentionViewAllHref(kind);
          return (
            <div key={kind}>
              <h3 className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                {t(`dashboard.attentionKinds.${kind}`)}
                <AdminBadge>{total}</AdminBadge>
              </h3>
              <ul className="divide-y">
                {items.map((row) => (
                  <li key={`${row.kind}-${row.ref_id}`}>
                    <Link
                      href={attentionHref({ ...row, kind })}
                      className="flex items-center gap-3 rounded-md px-1 py-2 hover:bg-muted/50"
                    >
                      <KindIcon
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {what(kind, row)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {row.user_name ||
                            row.user_email ||
                            t("dashboard.attentionRows.unknownUser")}
                        </span>
                      </span>
                      <time
                        dateTime={row.since}
                        className="shrink-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums"
                      >
                        {format.relativeTime(new Date(row.since), now)}
                      </time>
                      <ChevronRightIcon
                        aria-hidden
                        className="size-4 shrink-0 text-muted-foreground"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              {total > items.length ? (
                viewAll ? (
                  <Link
                    href={viewAll}
                    className="mt-1 inline-block text-xs font-medium text-link hover:underline"
                  >
                    {t("dashboard.viewAll", { count: total })}
                  </Link>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("dashboard.more", { count: total - items.length })}
                  </p>
                )
              ) : null}
            </div>
          );
        })}
      </AdminCardContent>
    </AdminCard>
  );
}
