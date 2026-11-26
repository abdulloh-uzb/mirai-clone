import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { EligibilityCheck } from "@/components/eligibility/eligibility-check";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/eligibility">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Eligibility" });
  return pageMetadata({
    locale,
    path: "/eligibility",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function EligibilityPage({
  params,
}: PageProps<"/[locale]/eligibility">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Eligibility" });

  // Keyed lists in the messages file (arrays are not allowed there).
  const tx = t as unknown as (key: string) => string;
  const list = (name: string, count: number, field?: string) =>
    Array.from({ length: count }, (_, i) =>
      tx(field ? `${name}.${i}.${field}` : `${name}.${i}`),
    );
  const pairs = (name: string, count: number, a: string, b: string) =>
    list(name, count, a).map((x, i) => ({
      a: x,
      b: tx(`${name}.${i}.${b}`),
    }));
  const checks = pairs("checks", 5, "q", "a");
  const noItems = list("noItems", 8);
  const vehicleCards = pairs("vehicleCards", 2, "t", "b");
  const faq = pairs("faq", 3, "q", "a");
  const h2 = "text-2xl font-bold tracking-tight md:text-3xl";

  return (
    <V2Root>
      <PageHero art="eligibility" title={t("title")} intro={t("intro")} />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm text-muted-foreground">{t("disclaimer")}</p>
        <div className="mt-6 rounded-2xl border bg-card p-6 shadow-md">
          <EligibilityCheck />
        </div>

        <section aria-labelledby="checks-heading" className="mt-16">
          <h2 id="checks-heading" className={h2}>
            {t("checksHeading")}
          </h2>
          <dl className="mt-6 grid gap-4">
            {checks.map((c) => (
              <div key={c.a} className="rounded-xl border bg-card p-5">
                <dt className="font-semibold">{c.a}</dt>
                <dd className="mt-1 text-muted-foreground">{c.b}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="no-heading" className="mt-16">
          <h2 id="no-heading" className={h2}>
            {t("noHeading")}
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {noItems.map((item) => (
              <li key={item} className="rounded-xl bg-muted px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="vehicle-heading" className="mt-16">
          <h2 id="vehicle-heading" className={h2}>
            {t("vehicleHeading")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {vehicleCards.map((c) => (
              <div key={c.a} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{c.a}</h3>
                <p className="mt-1 text-muted-foreground">{c.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="point-heading"
          className="mt-16 rounded-2xl bg-surface-sky p-6"
        >
          <h2 id="point-heading" className={h2}>
            {t("pointHeading")}
          </h2>
          <p className="mt-3 text-lg">{t("pointBody")}</p>
        </section>

        <section aria-labelledby="faq-heading" className="mt-16">
          <h2 id="faq-heading" className={h2}>
            {t("faqHeading")}
          </h2>
          <div className="mt-6 grid gap-4">
            {faq.map((f) => (
              <div key={f.a}>
                <h3 className="font-semibold">{f.a}</h3>
                <p className="mt-1 text-muted-foreground">{f.b}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="cta-heading"
          className="mt-16 rounded-2xl bg-muted p-6 text-center"
        >
          <h2 id="cta-heading" className={h2}>
            {t("ctaHeading")}
          </h2>
          <p className="mt-2 text-muted-foreground">{t("ctaBody")}</p>
          <Link
            href="/courses"
            className={cn(buttonVariants({ size: "lg" }), "mt-4")}
          >
            {t("ctaButton")}
          </Link>
        </section>
      </div>
    </V2Root>
  );
}
