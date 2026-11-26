import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="mt-6 overflow-x-auto rounded-[22px] border border-line-blue bg-card p-2">
      <table className="lms-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((c) => (
                <td key={c.header}>{c.cell(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 px-2 pt-3 pb-1 text-[15px]">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {t("previous")}
          </Link>
        ) : null}
        <span className="px-2 font-semibold text-muted-foreground">
          {t("page", { page })}
        </span>
        {hasNext ? (
          <Link
            href={href(page + 1)}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            {t("next")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
