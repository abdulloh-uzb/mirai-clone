import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { TileSearch } from "@/components/dmv-services/tile-search";
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-balance">
        {t("title")}
      </h1>
      <p
        role="note"
        className="mt-4 max-w-2xl rounded-lg border bg-muted px-4 py-3 text-sm"
      >
        {t("notice")}
      </p>
      <p className="mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">
        {t("intro")}
      </p>

      <div className="mt-8">
        <TileSearch tiles={tiles}>
          {DMV_SERVICE_GROUPS.map((group) => (
            <section
              key={group.id}
              data-group
              aria-labelledby={`group-${group.id}`}
            >
              <h2
                id={`group-${group.id}`}
                className="text-2xl font-bold tracking-tight"
              >
                {t(key(`groups.${group.id}`))}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.tiles.map((tile) => (
                  <li
                    key={tile.id}
                    data-tile={tile.id}
                    className="flex flex-col rounded-lg border p-4 [&[hidden]]:hidden"
                  >
                    <h3 className="font-semibold">
                      {t(key(`tiles.${tile.id}.title`))}
                    </h3>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">
                      {t(key(`tiles.${tile.id}.text`))}
                    </p>
                    <a
                      href={tile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t("openLink")}
                      <span className="sr-only"> {t("newTab")}</span>
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </TileSearch>
      </div>
    </div>
  );
}
