import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { DataTable } from "@/components/admin/data-table";
import { AdminFilterLinks } from "@/components/admin/filter-links";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StageBadge } from "@/components/admin/stage-badge";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminInput } from "@/components/admin/ui/input";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { parseStageParam, STUDENT_STAGES } from "@/lib/admin/stages";
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
  const stage = parseStageParam(sp.stage);
  const page = Math.max(1, Number(sp.page) || 1);
  const [t, tc, tStages, tNav, tDesc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.students" }),
    getTranslations({ locale, namespace: "Admin.common" }),
    getTranslations({ locale, namespace: "Admin.stages" }),
    getTranslations({ locale, namespace: "Admin.nav" }),
    getTranslations({ locale, namespace: "Admin.descriptions" }),
  ]);
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_search_students", {
    q,
    stage_filter: stage,
    lim: PAGE_SIZE + 1,
    off: (page - 1) * PAGE_SIZE,
  });
  const rows = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("students")}
        description={tDesc("students")}
      />
      <DataTable
        locale={locale}
        rows={rows}
        rowKey={(r) => r.user_id}
        basePath="/admin/students"
        page={page}
        pageSize={PAGE_SIZE}
        query={q}
        extraParams={stage ? { stage } : undefined}
        toolbar={
          <>
            <form
              role="search"
              className="flex w-full max-w-md items-center gap-2"
            >
              {stage ? (
                <input type="hidden" name="stage" value={stage} />
              ) : null}
              <div className="relative min-w-0 flex-1">
                <SearchIcon
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <AdminInput
                  type="search"
                  name="q"
                  defaultValue={q}
                  aria-label={t("searchLabel")}
                  placeholder={t("searchLabel")}
                  className="pl-8"
                />
              </div>
              <AdminButton type="submit" variant="outline">
                {tc("search")}
              </AdminButton>
            </form>
            <AdminFilterLinks
              label={t("stageFilterLabel")}
              items={[undefined, ...STUDENT_STAGES].map((s) => ({
                key: s ?? "all",
                href: {
                  pathname: "/admin/students",
                  query: {
                    ...(q ? { q } : {}),
                    ...(s ? { stage: s } : {}),
                  },
                },
                label: s ? tStages(s) : tc("all"),
                active: s === stage,
              }))}
            />
          </>
        }
        columns={[
          {
            header: t("name"),
            cell: (r) => (
              <Link
                href={`/admin/students/${r.user_id}`}
                className="font-medium hover:underline"
              >
                {r.first_name} {r.last_name}
              </Link>
            ),
          },
          {
            header: t("email"),
            cell: (r) => (
              <span className="text-muted-foreground">{r.email}</span>
            ),
          },
          { header: t("stage"), cell: (r) => <StageBadge stage={r.stage} /> },
          {
            header: t("license"),
            cell: (r) => r.license_no ?? "—",
            className: "font-mono text-xs",
          },
          {
            header: t("joined"),
            cell: (r) => r.created_at.slice(0, 10),
            className: "tabular-nums",
          },
        ]}
      />
    </div>
  );
}
