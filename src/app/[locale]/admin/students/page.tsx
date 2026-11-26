import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/admin/data-table";
import { StageBadge } from "@/components/admin/stage-badge";
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
  const [t, tc, tStages] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.students" }),
    getTranslations({ locale, namespace: "Admin.common" }),
    getTranslations({ locale, namespace: "Admin.stages" }),
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
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <form className="mt-4 flex gap-2" role="search">
        {stage ? <input type="hidden" name="stage" value={stage} /> : null}
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
      <nav
        aria-label={t("stageFilterLabel")}
        className="mt-4 flex flex-wrap gap-1.5"
      >
        {[undefined, ...STUDENT_STAGES].map((s) => (
          <Link
            key={s ?? "all"}
            href={{
              pathname: "/admin/students",
              query: { ...(q ? { q } : {}), ...(s ? { stage: s } : {}) },
            }}
            aria-current={s === stage ? "page" : undefined}
            className="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium hover:bg-accent aria-[current=page]:border-primary aria-[current=page]:bg-accent"
          >
            {s ? tStages(s) : tc("all")}
          </Link>
        ))}
      </nav>
      <DataTable
        locale={locale}
        rows={rows}
        rowKey={(r) => r.user_id}
        basePath="/admin/students"
        page={page}
        pageSize={PAGE_SIZE}
        query={q}
        extraParams={stage ? { stage } : undefined}
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
          { header: t("stage"), cell: (r) => <StageBadge stage={r.stage} /> },
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
