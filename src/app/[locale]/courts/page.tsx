import { MapPinIcon } from "lucide-react";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  CountyList,
  CountyMap,
  CountyPanel,
  CourtsExplorer,
  CourtsSearchForm,
} from "@/components/courts/courts-explorer";
import { siteConfig } from "@/config/site";
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

  const tr = await getTranslations({ locale, namespace: "Ref.courts" });
  const chips = popular.map((county) => county.name.replace(/ County$/, ""));

  return (
    <V2Root>
      <CourtsExplorer counties={counties}>
        <PageHero art="courts" title={t("title")} intro={t("intro")}>
          <CourtsSearchForm
            goLabel={tr("searchGo")}
            popularLabel={tr("popular")}
            chips={chips}
          />
        </PageHero>
        <section className="cx-work">
          <div className="cx-work-in" id="cxTool">
            <div className="cx-tool">
              <CountyMap label={tr("mapLabel")} source={tr("mapSource")} />
              <CountyPanel
                seeLabel={tr("seeCourt")}
                clearLabel={tr("pickAnother")}
              >
                <h2 id="popular-heading" className="cx-pick-h">
                  {tr("pickHeading")}
                </h2>
                <p className="cx-pick-p">{tr("pickHelp")}</p>
                <div
                  className="cx-quick"
                  role="group"
                  aria-label={t("popularHeading")}
                >
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
                <p className="cx-call">
                  {tr("callUs")}{" "}
                  <a className="linkish" href={siteConfig.contact.phoneHref}>
                    {siteConfig.contact.phone}
                  </a>
                </p>
              </CountyPanel>
            </div>
          </div>
        </section>
        <section className="cx-all" aria-labelledby="all-heading">
          <div className="cx-all-in">
            <h2 id="all-heading" tabIndex={-1}>
              {t("listHeading")}
            </h2>
            <CountyList items={items} />
          </div>
        </section>
      </CourtsExplorer>
    </V2Root>
  );
}
