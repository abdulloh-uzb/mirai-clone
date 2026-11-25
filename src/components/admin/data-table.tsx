import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export type Column<Row> = {
  header: string;
  cell: (row: Row) => React.ReactNode;
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

  if (!shown.length) {
    return <p className="mt-6 text-muted-foreground">{t("noResults")}</p>;
  }
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            {columns.map((c) => (
              <th key={c.header} className="py-2 pr-4 font-medium">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr key={rowKey(row)} className="border-b align-top">
              {columns.map((c) => (
                <td key={c.header} className="py-2 pr-4">
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center gap-4 text-sm">
        {page > 1 ? <Link href={href(page - 1)}>{t("previous")}</Link> : null}
        <span className="text-muted-foreground">{t("page", { page })}</span>
        {hasNext ? <Link href={href(page + 1)}>{t("next")}</Link> : null}
      </div>
    </div>
  );
}
