import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { Database } from "@/lib/database.types";
import { StageBadge } from "../stage-badge";
import { AdminCard, AdminCardHeader, AdminCardTitle } from "../ui/card";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "../ui/table";

type Row =
  Database["public"]["Functions"]["admin_search_students"]["Returns"][number];

export async function RecentStudents({
  locale,
  rows,
}: {
  locale: Locale;
  rows: Row[];
}) {
  const [t, tStudents, format] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    getTranslations({ locale, namespace: "Admin.students" }),
    getFormatter({ locale }),
  ]);
  return (
    <AdminCard>
      <AdminCardHeader>
        <AdminCardTitle>{t("dashboard.recentHeading")}</AdminCardTitle>
        <Link
          href="/admin/students"
          className="text-xs font-medium text-link hover:underline"
        >
          {t("dashboard.recentViewAll")}
        </Link>
      </AdminCardHeader>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          {t("dashboard.recentEmpty")}
        </p>
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              <AdminTableHead>{tStudents("name")}</AdminTableHead>
              <AdminTableHead>{t("dashboard.stage")}</AdminTableHead>
              <AdminTableHead>{t("dashboard.signedUp")}</AdminTableHead>
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {rows.map((r) => (
              <AdminTableRow key={r.user_id}>
                <AdminTableCell>
                  <Link
                    href={`/admin/students/${r.user_id}`}
                    className="font-medium hover:underline"
                  >
                    {r.first_name} {r.last_name}
                  </Link>
                  <div className="max-w-48 truncate text-xs text-muted-foreground">
                    {r.email}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <StageBadge stage={r.stage} />
                </AdminTableCell>
                <AdminTableCell>
                  {format.dateTime(new Date(r.created_at), {
                    dateStyle: "medium",
                    timeZone: "America/Los_Angeles",
                  })}
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
    </AdminCard>
  );
}
