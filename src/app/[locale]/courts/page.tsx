import { PageHero, V2Root } from "@/components/layout/page-hero";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CountyCard } from "@/components/courts/county-card";
import { CountySearch } from "@/components/courts/county-search";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { listCounties } from "@/lib/courts/counties";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courts">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Courts" });
  return pageMetadata({
    locale,
    path: "/courts",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function CourtsPage({
  params,
}: PageProps<"/[locale]/courts">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Courts" });
  const counties = await listCounties();

  const popular = counties
    .filter((c) => c.popularRank !== null && c.popularRank <= 4)
    .sort((a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0));

  const items = counties.map((county) => {
    const first = county.courthouses[0];
    const more = county.courthouses.length - 1;
    return {
      county,
      row: (
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl border-2 border-b-4 border-b-brand-green bg-card px-4 py-3">
          <Link
            href={`/courts/${county.slug}`}
            className="min-w-40 font-semibold text-link hover:underline"
          >
            {county.name}
          </Link>
          <span className="text-muted-foreground">{county.seatCity}</span>
          {first?.courtCode ? (
            <span className="text-sm text-muted-foreground">
              {t("courtCode", { code: first.courtCode })}
            </span>
          ) : null}
          {more > 0 ? (
            <span className="text-sm text-muted-foreground">
              {t("moreCourthouses", { count: more })}
            </span>
          ) : null}
        </div>
      ),
    };
  });

  return (
    <V2Root>
      <PageHero art="courts" title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <section aria-labelledby="popular-heading">
          <h2
            id="popular-heading"
            className="text-2xl font-bold tracking-tight"
          >
            {t("popularHeading")}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((county) => (
              <CountyCard key={county.slug} county={county} />
            ))}
          </div>
        </section>

        <section aria-labelledby="all-heading" className="mt-12">
          <h2
            id="all-heading"
            className="mb-4 text-2xl font-bold tracking-tight"
          >
            {t("listHeading")}
          </h2>
          <CountySearch items={items} />
        </section>
      </div>
    </V2Root>
  );
}
