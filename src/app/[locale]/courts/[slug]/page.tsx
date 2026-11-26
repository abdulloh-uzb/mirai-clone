import { ChevronLeftIcon, ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import { Markdown } from "@/components/content/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { CountyPlan, type PlanLabels } from "@/components/courts/county-plan";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCountyBySlug } from "@/lib/courts/counties";
import { publicEnv } from "@/lib/env";
import { breadcrumbList } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/page-metadata";

/** Counties with a map picture in public/reference/counties. */
const COUNTY_MAPS = new Set([
  "los-angeles-county",
  "san-diego-county",
  "orange-county",
  "riverside-county",
  "yolo-county",
]);

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courts/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const county = await getCountyBySlug(slug);
  if (!county) return {};
  const t = await getTranslations({ locale, namespace: "County" });
  return pageMetadata({
    locale,
    path: `/courts/${county.slug}`,
    title: t("metaTitle", { county: county.name }),
    description: t("metaDescription", { county: county.name }),
  });
}

export default async function CountyPage({
  params,
}: PageProps<"/[locale]/courts/[slug]">) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const county = await getCountyBySlug(slug);
  if (!county) notFound();

  const t = await getTranslations({ locale, namespace: "County" });
  const addendum = county.instructions[locale] ?? county.instructions.en;
  const values = { county: county.name };

  const steps = [
    { title: t("howTitle"), body: t("howBody", values) },
    { title: t("deadlineTitle"), body: t("deadlineBody") },
    { title: t("citationTitle"), body: t("citationBody") },
  ];

  const tr = await getTranslations({ locale, namespace: "Ref.county" });
  const mapSrc = COUNTY_MAPS.has(county.slug)
    ? `/reference/counties/${county.slug}-map.webp`
    : "/placeholder/county-card.svg";
  const plain = county.name.replace(/ County$/, "");
  const labels: PlanLabels = {
    stepOf: tr.raw("stepOf") as string,
    which: tr("which"),
    whichHelp: tr("whichHelp"),
    next: tr("next"),
    dueQ: tr("dueQ"),
    dueHelp: tr("dueHelp"),
    dueLabel: tr("dueLabel"),
    back: tr("back"),
    planTitle: tr("planTitle"),
    courthouse: tr("courthouse"),
    courtCode: t("courtCode"),
    noCode: tr("noCode"),
    dueDate: tr("dueDate"),
    daysLeft: tr.raw("daysLeft") as string,
    late: tr("late"),
    askBefore: tr("askBefore"),
    stepsHeading: tr("stepsHeading"),
    steps: [t("howBody", values), t("deadlineBody"), t("ctaBody")],
    cta: t("ctaButton"),
    startOver: tr("startOver"),
    nothingSaved: tr("nothingSaved"),
    strip: [tr("stripCourthouse"), tr("stripDue"), tr("stripPlan")],
    stripLabel: tr("stripLabel"),
    current: tr("current"),
    waiting: tr("waiting"),
    done: tr("done"),
    mapAlt: tr("mapAlt", { county: county.name }),
  };
  const cards = [
    { id: "court-houses", art: "finish", label: t("courthousesHeading") },
    { id: "court-codes", art: "ticket", label: tr("codesHeading") },
    { id: "court-how", art: "elig-court", label: t("instructionsHeading") },
    { id: "court-start", art: "dmv-car", label: t("ctaHeading") },
  ];

  return (
    <V2Root>
      <PageHero
        art="place"
        className="ct-hero"
        titleId="court-h1"
        title={
          <span className="ct-nb">{tr("heroTitle", { county: plain })}</span>
        }
        intro={tr("heroIntro")}
      >
        <Link className="back-btn ct-ret" href="/courts">
          <ChevronLeftIcon aria-hidden />
          {tr("allCourts")}
        </Link>
      </PageHero>
      <div className="ct-work">
        <div className="ct-work-in">
          <JsonLd
            data={breadcrumbList(publicEnv.NEXT_PUBLIC_SITE_URL, locale, [
              { name: t("breadcrumbHome"), path: "/" },
              { name: t("breadcrumbCourts"), path: "/courts" },
              { name: county.name, path: `/courts/${county.slug}` },
            ])}
          />
          <nav aria-label={t("breadcrumbLabel")} className="text-sm">
            <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <li>
                <Link href="/" className="underline-offset-4 hover:underline">
                  {t("breadcrumbHome")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href="/courts"
                  className="underline-offset-4 hover:underline"
                >
                  {t("breadcrumbCourts")}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li aria-current="page">{county.name}</li>
            </ol>
          </nav>
          <p role="note" className="notice">
            {t("demoNotice")}
          </p>

          <CountyPlan
            courthouses={county.courthouses}
            mapSrc={mapSrc}
            labels={labels}
            stepArt={["elig-18months", "certificate"]}
          />

          <section aria-labelledby="ctAboutH">
            <h2 className="ct-h" id="ctAboutH">
              {tr("aboutHeading", { county: t("title", values) })}
            </h2>
            <ul className="ct-grid">
              {cards.map((card) => (
                <li key={card.id}>
                  <a className="ct-cd" href={`#${card.id}`}>
                    <span className="ct-cpic" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="pic-day"
                        src={`/reference/art/${card.art}.webp`}
                        alt=""
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="pic-night"
                        src={`/reference/art/${card.art}-night.webp`}
                        alt=""
                        aria-hidden="true"
                      />
                    </span>
                    <span className="ct-cq">{card.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section id="court-houses" aria-labelledby="courthouses-heading">
            <h2 id="courthouses-heading" className="ct-h">
              {t("courthousesHeading")}
            </h2>
            {county.courthouses.map((house, index) => (
              <div className="ct-hs" key={`${house.name}-${house.courtCode}`}>
                <h3>
                  <span className="ct-pin" aria-hidden="true">
                    {index + 1}
                  </span>
                  {house.name}
                </h3>
                <address>{house.address ?? t("noAddress")}</address>
                {house.courtCode ? (
                  <p className="ct-hs-m">
                    <span className="sr">{t("courtCode")}: </span>
                    <span className="kit-code">{house.courtCode}</span>
                  </p>
                ) : null}
              </div>
            ))}
          </section>

          <section id="court-codes" aria-labelledby="codes-heading">
            <h2 id="codes-heading" className="ct-h">
              {tr("codesHeading")}
            </h2>
            <p>{tr("codesBody")}</p>
          </section>

          <section id="court-how" aria-labelledby="instructions-heading">
            <h2 id="instructions-heading" className="ct-h">
              {t("instructionsHeading")}
            </h2>
            <ol className="ct-ol">
              {steps.map((step) => (
                <li key={step.title}>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            {addendum ? <Markdown>{addendum}</Markdown> : null}
            {county.caseLookupUrl ? (
              <p className="ct-more">
                <a
                  href={county.caseLookupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("caseLookup")}
                  <span className="sr-only"> {t("opensInNewTab")}</span>
                  <ExternalLinkIcon aria-hidden className="size-4" />
                </a>
              </p>
            ) : null}
          </section>

          <section id="court-start" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="ct-h">
              {t("ctaHeading")}
            </h2>
            <p>{t("ctaBody")}</p>
            <div className="ct-acts">
              <Link href="/courses" className="btn btn-primary btn-lg">
                {t("ctaButton")}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </V2Root>
  );
}
