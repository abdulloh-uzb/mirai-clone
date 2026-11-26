import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { EligibilityCheck } from "@/components/eligibility/eligibility-check";
import { PageHero, V2Root } from "@/components/layout/page-hero";
import { ExternalLinkIcon, InfoIcon, XCircleIcon } from "lucide-react";
import { V2Accordion } from "@/components/ref/ref-client";
import { Link } from "@/i18n/navigation";
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
  const tr = await getTranslations({ locale, namespace: "Ref.eligibility" });
  const labels = {
    questionOf: tr.raw("questionOf") as string,
    why: tr("why"),
    back: tr("back"),
    startOver: tr("startOver"),
    thumbsLabel: tr("thumbsLabel"),
    current: tr("current"),
    todo: tr("todo"),
    done: tr("done"),
    thumbs: {
      validLicense: tr("thumbs.validLicense"),
      courtAllowed: tr("thumbs.courtAllowed"),
      noRecentSchool: tr("thumbs.noRecentSchool"),
      nonCommercial: tr("thumbs.nonCommercial"),
      eligibleViolation: tr("thumbs.eligibleViolation"),
    },
  };
  // Official source for each check (in the order of `checks` in the messages).
  const sources = [
    {
      href: "https://selfhelp.courts.ca.gov/traffic/traffic-school",
      label: tr("sources.selfHelp"),
    },
    {
      href: "https://selfhelp.courts.ca.gov/traffic/traffic-school",
      label: tr("sources.selfHelp"),
    },
    {
      href: "https://selfhelp.courts.ca.gov/traffic/traffic-school",
      label: tr("sources.selfHelp"),
    },
    {
      href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=1808.7",
      label: tr("sources.vc1808"),
    },
    {
      href: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=VEH&sectionNum=42005",
      label: tr("sources.vc42005"),
    },
  ];

  return (
    <V2Root>
      <PageHero art="eligibility" title={t("title")} intro={t("intro")}>
        <div className="el-acts">
          <a className="btn btn-primary btn-lg" href="#eligibility-check">
            {tr("start")}
          </a>
          <Link className="btn btn-secondary btn-lg" href="/courts">
            {t("findCourt")}
          </Link>
        </div>
        <p className="el-note">{tr("note")}</p>
      </PageHero>
      <div className="el-work">
        <div className="el-work-in">
          <section
            id="eligibility-check"
            className="el-check"
            aria-label={tr("start")}
          >
            <EligibilityCheck labels={labels} />
            <p className="el-fine">{t("disclaimer")}</p>
          </section>
        </div>
      </div>

      <section
        id="the-rules"
        aria-labelledby="checks-heading"
        className="v2-section"
      >
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="checks-heading" className="v2-h2">
              {t("checksHeading")}
            </h2>
            <p>{tr("rulesIntro")}</p>
          </div>
          <ul className="lw-list">
            {checks.map((c, i) => (
              <li key={c.a} className="lw-row">
                <span className="lw-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{c.a}</h3>
                <div className="lw-body">
                  <p>{c.b}</p>
                  <a
                    className="lw-src"
                    href={sources[i].href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {sources[i].label}
                    <ExternalLinkIcon aria-hidden />
                    <span className="sr-only"> {tr("newTab")}</span>
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <div className="lw-foot">
            <p>{t("disclaimer")}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="no-heading" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="no-heading" className="v2-h2">
              {t("noHeading")}
            </h2>
          </div>
          <ul className="lw-two">
            {noItems.map((item) => (
              <li key={item}>
                <XCircleIcon aria-hidden />
                <div>
                  <h3>{item}</h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="vehicle-heading" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="vehicle-heading" className="v2-h2">
              {t("vehicleHeading")}
            </h2>
          </div>
          <ul className="lw-two">
            {vehicleCards.map((c) => (
              <li key={c.a}>
                <InfoIcon aria-hidden />
                <div>
                  <h3>{c.a}</h3>
                  <p>{c.b}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="lw-note">
            <InfoIcon aria-hidden />
            <span>
              <b>{t("pointHeading")}</b> {t("pointBody")}
            </span>
          </p>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="faq-heading" className="v2-h2">
              {t("faqHeading")}
            </h2>
          </div>
          <div className="lw-faq">
            <div className="v2-acc">
              <V2Accordion
                items={faq.map((f, i) => ({
                  id: `elig-${i}`,
                  question: f.a,
                  answer: f.b,
                }))}
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="cta-heading" className="v2-section">
        <div className="v2-container">
          <div className="lw-cta">
            <span className="v2-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="pic-day"
                src="/reference/art/finish.webp"
                alt=""
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="pic-night"
                src="/reference/art/finish-night.webp"
                alt=""
                aria-hidden="true"
              />
            </span>
            <div>
              <h2 id="cta-heading">{t("ctaHeading")}</h2>
              <p>{t("ctaBody")}</p>
              <div className="lw-acts">
                <Link href="/courses" className="btn btn-primary btn-lg">
                  {t("ctaButton")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </V2Root>
  );
}
