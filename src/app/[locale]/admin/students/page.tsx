import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 25;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/students">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.students" });
  return { title: t("title") };
}

export default async function AdminStudentsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/students">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.students" }),
    getTranslations({ locale, namespace: "Admin.common" }),
  ]);
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_search_students", {
    q,
    lim: PAGE_SIZE + 1,
    off: (page - 1) * PAGE_SIZE,
  });
  const rows = data ?? [];

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <form className="mt-4 flex gap-2" role="search">
        <input
          type="search"
          name="q"
          defaultValue={q}
          aria-label={t("searchLabel")}
          placeholder={t("searchLabel")}
          className="w-full max-w-md rounded-md border bg-background px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          {tc("search")}
        </button>
      </form>
      <DataTable
        locale={locale}
        rows={rows}
        rowKey={(r) => r.user_id}
        basePath="/admin/students"
        page={page}
        pageSize={PAGE_SIZE}
        query={q}
        columns={[
          {
            header: t("name"),
            cell: (r) => (
              <Link
                href={`/admin/students/${r.user_id}`}
                className="font-medium underline"
              >
                {r.first_name} {r.last_name}
              </Link>
            ),
          },
          { header: t("email"), cell: (r) => r.email },
          { header: t("license"), cell: (r) => r.license_no ?? "—" },
          {
            header: t("joined"),
            cell: (r) => r.created_at.slice(0, 10),
          },
        ]}
      />
    </section>
  );
}
