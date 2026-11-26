import { PageHero, V2Root } from "@/components/layout/page-hero";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  DmvExplorer,
  DmvGroupTabs,
  DmvSearchForm,
  DmvSituations,
  DmvStatus,
  type Situation,
} from "@/components/dmv-services/dmv-explorer";
import { DMV_SERVICE_GROUPS } from "@/config/dmv-services";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dmv-services">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "DmvServices" });
  return pageMetadata({
    locale,
    path: "/dmv-services",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function DmvServicesPage({
  params,
}: PageProps<"/[locale]/dmv-services">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "DmvServices" });

  // Tile and group ids come from config; the test checks every one has copy.
  const key = (k: string) => k as Parameters<typeof t>[0];

  const tiles = DMV_SERVICE_GROUPS.flatMap((g) => g.tiles).map((tile) => ({
    id: tile.id,
    title: t(key(`tiles.${tile.id}.title`)),
    keywords: t(key(`tiles.${tile.id}.keywords`)),
  }));

  const tr = await getTranslations({ locale, namespace: "Ref.dmv" });
  const trKey = (k: string) => k as Parameters<typeof tr>[0];
  const tileText = (id: string) => ({
    id,
    title: t(key(`tiles.${id}.title`)),
    text: t(key(`tiles.${id}.text`)),
  });
  const urls = new Map(
    DMV_SERVICE_GROUPS.flatMap((g) => g.tiles).map((x) => [x.id, x.url]),
  );
  const situations: Situation[] = SITUATIONS.map((item) => {
    const group = DMV_SERVICE_GROUPS.find((g) => g.id === item.group);
    return {
      id: item.id,
      art: item.art,
      title: tr(trKey(`situations.${item.id}.title`)),
      description: tr(trKey(`situations.${item.id}.description`)),
      tiles: (group?.tiles ?? []).map((tile) => ({
        id: tile.id,
        title: tileText(tile.id).title,
        url: urls.get(tile.id) ?? tile.url,
      })),
    };
  });
  const groups = DMV_SERVICE_GROUPS.map((group) => ({
    id: group.id,
    label: t(key(`groups.${group.id}`)),
    count: group.tiles.length,
  }));

  return (
    <V2Root>
      <DmvExplorer
        tiles={tiles}
        firstGroup={DMV_SERVICE_GROUPS[0].id}
        firstSituation={SITUATIONS[0].id}
      >
        <PageHero art="dmv" title={t("title")} intro={t("intro")}>
          <DmvSearchForm goLabel={tr("searchGo")} />
          <p
            role="note"
            className="mt-4 rounded-lg border bg-card/80 px-4 py-3 text-sm"
          >
            {t("notice")}
          </p>
        </PageHero>
        <DmvSituations
          situations={situations}
          heading={tr("sitHeading")}
          label={tr("sitLabel")}
          hostLabel="dmv.ca.gov"
          newTab={t("newTab")}
        />
        <section className="dm-all" aria-labelledby="dmAllH">
          <div className="dm-in">
            <h2 id="dmAllH" className="dm-h">
              {tr("allHeading")}
            </h2>
            <div className="dm-all-in">
              <DmvGroupTabs groups={groups} label={tr("allLabel")} />
              <div className="dm-main">
                <DmvStatus />
                {DMV_SERVICE_GROUPS.map((group) => (
                  <section
                    key={group.id}
                    id={`group-${group.id}`}
                    role="tabpanel"
                    data-group={group.id}
                    aria-labelledby={`dmAll-${group.id}`}
                  >
                    <h3 className="dm-h3">{t(key(`groups.${group.id}`))}</h3>
                    <ul className="flat-list dm-list dm-compact mt-4">
                      {group.tiles.map((tile) => (
                        <li
                          key={tile.id}
                          data-tile={tile.id}
                          className="[&[hidden]]:hidden"
                        >
                          <a
                            className="flat-row"
                            href={tile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="fr-t">
                              <b>{t(key(`tiles.${tile.id}.title`))}</b>
                              <span>{t(key(`tiles.${tile.id}.text`))}</span>
                            </span>
                            <span className="dm-host">dmv.ca.gov</span>
                            <span className="sr-only">{t("newTab")}</span>
                            <ExternalLink
                              className="ext-ic"
                              aria-hidden="true"
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>
      </DmvExplorer>
    </V2Root>
  );
}

/** The six situations; each shows the tiles of one service group. */
const SITUATIONS = [
  { id: "moved", art: "dmv-moved", group: "moving" },
  { id: "expiring", art: "dmv-expiring", group: "renewals" },
  { id: "car", art: "dmv-car", group: "vehicles" },
  { id: "lost", art: "dmv-lost", group: "replace" },
  { id: "realid", art: "dmv-realid", group: "real-id" },
  { id: "check", art: "dmv-check", group: "status-pay" },
] as const;
