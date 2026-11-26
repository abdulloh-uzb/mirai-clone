import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { CRUD, type CrudTable } from "@/lib/admin/crud";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe, paymentsMode } from "@/lib/stripe/server";

const TABS: { key: string; label: string; table?: CrudTable }[] = [
  { key: "faq", label: "FAQ", table: "faq_items" },
  { key: "pages", label: "Pages", table: "pages" },
  { key: "announcements", label: "Announcements", table: "announcements" },
  { key: "changelog", label: "What's new", table: "changelog" },
  { key: "posts", label: "Blog", table: "posts" },
  { key: "reviews", label: "Reviews", table: "reviews" },
  { key: "prices", label: "Prices", table: "courses" },
  { key: "coupons", label: "Coupons" },
];

/** Slugs that exist in some UI languages but not all of them. */
function untranslated(rows: { locale?: unknown; slug?: unknown }[]) {
  const bySlug = new Map<string, Set<string>>();
  for (const r of rows) {
    if (typeof r.slug !== "string") continue;
    bySlug.set(r.slug, (bySlug.get(r.slug) ?? new Set()).add(String(r.locale)));
  }
  return [...bySlug.entries()]
    .map(([slug, have]) => ({
      slug,
      missing: routing.locales.filter((l) => !have.has(l)),
    }))
    .filter((x) => x.missing.length > 0);
}

async function Coupons() {
  if (paymentsMode() === "mock") {
    // TODO(spec): coupons are Stripe promotion codes; nothing to manage in mock mode.
    return (
      <p className="mt-4 text-muted-foreground">Coupons need Stripe keys.</p>
    );
  }
  const codes = await getStripe().promotionCodes.list({ limit: 50 });
  return (
    <ul className="mt-4 list-disc pl-6 text-sm">
      {codes.data.map((c) => (
        <li key={c.id}>
          {c.code} {c.active ? "" : "(inactive)"}
        </li>
      ))}
      {codes.data.length === 0 ? <li>No promotion codes.</li> : null}
    </ul>
  );
}

export default async function AdminSiteContentPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/site-content">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  let rows: Record<string, unknown>[] = [];
  if (tab.table) {
    const { data } = await createServiceClient()
      .from(tab.table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    rows = (data ?? []) as Record<string, unknown>[];
  }
  const gaps =
    tab.table && CRUD[tab.table].fields.some((f) => f.name === "slug")
      ? untranslated(rows)
      : [];

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Site content</h1>
      <nav className="mt-4 flex flex-wrap gap-2 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/site-content?tab=${t.key}`}
            className={`rounded-md border px-3 py-1 ${t.key === tab.key ? "bg-muted font-semibold" : ""}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab.key === "coupons" ? (
        <Coupons />
      ) : tab.table ? (
        <>
          {tab.key === "reviews" ? (
            // TODO(spec): reviews have no "sample" column; all seeded reviews are samples.
            <p className="mt-4 text-sm text-muted-foreground">
              Seeded reviews are samples, not real customer reviews.
            </p>
          ) : null}
          {gaps.length ? (
            <p className="mt-4 text-sm text-amber-700">
              Missing translations:{" "}
              {gaps
                .map((g) => `${g.slug} (${g.missing.join(", ")})`)
                .join("; ")}
            </p>
          ) : null}
          <CrudList
            table={tab.table}
            rows={rows}
            allowCreate={tab.table !== "courses"}
            allowDelete={tab.table !== "courses"}
          />
        </>
      ) : null}
    </section>
  );
}
