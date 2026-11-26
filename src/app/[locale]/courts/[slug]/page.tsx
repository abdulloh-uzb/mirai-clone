import { ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCountyBySlug } from "@/lib/courts/counties";
import { publicEnv } from "@/lib/env";
import { breadcrumbList } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { cn } from "@/lib/utils";

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

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
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
            <Link href="/courts" className="underline-offset-4 hover:underline">
              {t("breadcrumbCourts")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">{county.name}</li>
        </ol>
      </nav>

      <p
        role="note"
        className="mt-6 rounded-lg border border-amber-500/60 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
      >
        {t("demoNotice")}
      </p>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance">
        {t("title", values)}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {t("seat", { city: county.seatCity })}
      </p>

      <section aria-labelledby="courthouses-heading" className="mt-10">
        <h2
          id="courthouses-heading"
          className="text-2xl font-bold tracking-tight"
        >
          {t("courthousesHeading")}
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {county.courthouses.map((house) => (
            <li
              key={`${house.name}-${house.courtCode}`}
              className="rounded-lg border p-4"
            >
              <p className="font-semibold">{house.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {house.address ?? t("noAddress")}
              </p>
              {house.courtCode ? (
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("courtCode")}:{" "}
                  </span>
                  <span className="font-mono">{house.courtCode}</span>
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="instructions-heading"
        className="deferred-section mt-10"
      >
        <h2
          id="instructions-heading"
          className="text-2xl font-bold tracking-tight"
        >
          {t("instructionsHeading")}
        </h2>
        <ol className="mt-4 space-y-4">
          {steps.map((step) => (
            <li key={step.title}>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 leading-7">{step.body}</p>
            </li>
          ))}
        </ol>
        {addendum ? <Markdown>{addendum}</Markdown> : null}
        {county.caseLookupUrl ? (
          <p className="mt-6">
            <a
              href={county.caseLookupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-link underline underline-offset-4"
            >
              {t("caseLookup")}
              <span className="sr-only"> {t("opensInNewTab")}</span>
              <ExternalLinkIcon aria-hidden className="size-4" />
            </a>
          </p>
        ) : null}
      </section>

      <section className="deferred-section mt-12 rounded-xl bg-muted p-6">
        <h2 className="text-2xl font-bold tracking-tight">{t("ctaHeading")}</h2>
        <p className="mt-2">{t("ctaBody")}</p>
        <Link
          href="/courses"
          className={cn(buttonVariants({ size: "lg" }), "mt-4")}
        >
          {t("ctaButton")}
        </Link>
      </section>
    </div>
  );
}
