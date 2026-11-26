import { SearchXIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import {
  AdminCard,
  AdminCardDescription,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminPagination } from "@/components/admin/ui/pagination";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/table";

export type Column<Row> = {
  header: string;
  cell: (row: Row) => React.ReactNode;
  /** Applied to both the header and the cells of this column. */
  className?: string;
};

/**
 * Server-rendered table. Paging and search live in the URL (`?page=`, `?q=`),
 * so the page fetches `pageSize + 1` rows and passes them in; the extra row
 * only tells the table that a next page exists.
 */
export async function DataTable<Row>({
  locale,
  columns,
  rows,
  rowKey,
  basePath,
  page,
  pageSize,
  query,
  extraParams,
  title,
  description,
  toolbar,
  emptyTitle,
}: {
  locale: Locale;
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  basePath: string;
  page: number;
  pageSize: number;
  query?: string;
  extraParams?: Record<string, string>;
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
}) {
  const t = await getTranslations({ locale, namespace: "Admin.common" });
  const hasNext = rows.length > pageSize;
  const shown = rows.slice(0, pageSize);
  const href = (p: number) => {
    const params = new URLSearchParams(extraParams);
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <AdminCard className="overflow-hidden">
      {title || toolbar ? (
        <div className="flex flex-col gap-3 border-b px-4 py-3">
          {title ? (
            <div>
              <AdminCardTitle>{title}</AdminCardTitle>
              {description ? (
                <AdminCardDescription>{description}</AdminCardDescription>
              ) : null}
            </div>
          ) : null}
          {toolbar}
        </div>
      ) : null}
      {shown.length === 0 ? (
        <AdminEmpty icon={SearchXIcon} title={emptyTitle ?? t("noResults")} />
      ) : (
        <AdminTable>
          <AdminTableHeader>
            <AdminTableRow>
              {columns.map((c) => (
                <AdminTableHead key={c.header} className={c.className}>
                  {c.header}
                </AdminTableHead>
              ))}
            </AdminTableRow>
          </AdminTableHeader>
          <AdminTableBody>
            {shown.map((row) => (
              <AdminTableRow key={rowKey(row)}>
                {columns.map((c) => (
                  <AdminTableCell key={c.header} className={c.className}>
                    {c.cell(row)}
                  </AdminTableCell>
                ))}
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
      )}
      {shown.length > 0 && (page > 1 || hasNext) ? (
        <AdminPagination
          label={t("pagination")}
          pageLabel={t("page", { page })}
          previousHref={page > 1 ? href(page - 1) : null}
          nextHref={hasNext ? href(page + 1) : null}
          previousLabel={t("previous")}
          nextLabel={t("next")}
        />
      ) : null}
    </AdminCard>
  );
}
