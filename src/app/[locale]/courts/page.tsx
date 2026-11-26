import { MapPinIcon } from "lucide-react";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
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

/** Counties with a map picture in public/reference/counties. */
const COUNTY_MAPS = new Set([
  "los-angeles-county",
  "san-diego-county",
  "orange-county",
  "riverside-county",
  "yolo-county",
]);

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
        <Link className="cx-t" href={`/courts/${county.slug}`}>
          <MapPinIcon aria-hidden />
          <span className="cx-t-txt">
            <b>{county.name}</b>
            <span className="cx-t-city">{county.seatCity}</span>
            {first?.courtCode ? (
              <span className="cx-t-code">
                {t("courtCode", { code: first.courtCode })}
                {more > 0 ? <i> +{more}</i> : null}
              </span>
            ) : null}
          </span>
        </Link>
      ),
    };
  });

  return (
    <V2Root>
      <PageHero art="courts" title={t("title")} intro={t("intro")} />
      <section className="cx-work" aria-labelledby="popular-heading">
        <div className="cx-work-in">
          <div className="cx-tool">
            <div className="cx-panel">
              <h2 id="popular-heading" className="cx-pick-h">
                {t("popularHeading")}
              </h2>
              <div className="cx-quick">
                {popular.map((county) => (
                  <Link
                    key={county.slug}
                    href={`/courts/${county.slug}`}
                    className="cx-card"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        COUNTY_MAPS.has(county.slug)
                          ? `/reference/counties/${county.slug}-map.webp`
                          : "/placeholder/county-card.svg"
                      }
                      alt=""
                      width="1800"
                      height="1200"
                    />
                    <span>{county.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="cx-all" aria-labelledby="all-heading">
        <div className="cx-all-in">
          <h2 id="all-heading">{t("listHeading")}</h2>
          <CountySearch items={items} />
        </div>
      </section>
    </V2Root>
  );
}
