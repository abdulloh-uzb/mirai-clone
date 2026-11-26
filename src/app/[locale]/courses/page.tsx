import { PageHero, V2Root } from "@/components/layout/page-hero";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { LazyClassroomWaitlistForm } from "@/components/courses/lazy-classroom-waitlist-form";
import { CitationStateSelector } from "@/components/courses/citation-state-selector";
import { CourseChooser } from "@/components/courses/course-chooser";
import { Markdown } from "@/components/content/markdown";
import { V2Accordion } from "@/components/ref/ref-client";
import {
  BookOpenCheckIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClipboardCheckIcon,
  LanguagesIcon,
  MonitorSmartphoneIcon,
  SchoolIcon,
  SendIcon,
} from "lucide-react";
import { listFeaturedFaq } from "@/lib/faq/faq";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getTicketState } from "@/lib/citation-state.server";
import { buyHref, parseCourseLanguage } from "@/lib/courses/course-language";
import {
  formatUsd,
  getClassroomCourse,
  getCourseRules,
  getOnlineCourse,
  listStates,
} from "@/lib/courses/courses";
import { listCounties } from "@/lib/courts/counties";
import { publicEnv } from "@/lib/env";
import { course } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/courses">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Courses" });
  // The canonical URL never carries ?course=.
  return pageMetadata({
    locale,
    path: "/courses",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function CoursesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/courses">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const courseLanguage =
    parseCourseLanguage((await searchParams).course) ?? locale;

  const [
    t,
    tr,
    account,
    online,
    classroom,
    rules,
    states,
    ticketState,
    counties,
    faq,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "Courses" }),
    getTranslations({ locale, namespace: "Ref.courses" }),
    getCurrentAccount(),
    getOnlineCourse(),
    getClassroomCourse(),
    getCourseRules(),
    listStates(),
    getTicketState(),
    listCounties(),
    listFeaturedFaq(locale),
  ]);

  return (
    <V2Root>
      <JsonLd
        data={course({
          siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL,
          locale,
          name: t("panel.title"),
          description: t("metaDescription"),
          path: "/courses",
          priceCents: online.priceCents,
          providerName: siteConfig.name,
          languages: routing.locales,
        })}
      />
      <PageHero art="courses" title={t("title")} intro={t("intro")}>
        <div className="cc-acts">
          <a className="btn btn-primary btn-lg" href="#ccBody">
            {tr("chooseLanguage")}
          </a>
          <Link className="btn btn-secondary btn-lg" href="/eligibility">
            {tr("checkEligibility")}
          </Link>
        </div>
        <div className="mt-6">
          <CitationStateSelector states={states} current={ticketState} />
        </div>
      </PageHero>
      <div className="cc-work">
        <div id="ccBody">
          <CourseChooser
            selected={courseLanguage}
            locale={locale}
            signedIn={account !== null}
            accessDays={rules.accessDays}
          />
        </div>
      </div>

      <section aria-labelledby="syllabus-heading" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="syllabus-heading" className="v2-h2">
              {t("syllabusHeading")}
            </h2>
            <p>{tr("syllabusIntro")}</p>
          </div>
          <ol className="lw-syl">
            {online.sections.map((section) => (
              <li key={section.position}>
                <span aria-hidden="true" className="lw-num">
                  {String(section.position).padStart(2, "0")}
                </span>
                <div>
                  <h3>{section.title[locale] ?? section.title.en}</h3>
                </div>
              </li>
            ))}
          </ol>
          <p className="lw-note">
            <CheckCircle2Icon aria-hidden />
            {tr("quizNote", { pct: rules.passPct })}
          </p>
        </div>
      </section>

      <section aria-labelledby="cc-how-h" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="cc-how-h" className="v2-h2">
              {tr("stepsHeading")}
            </h2>
            <p>{tr("stepsIntro")}</p>
          </div>
          <ol className="lw-steps">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.key}>
                  <span className="lw-step-ic">
                    <Icon aria-hidden />
                  </span>
                  <p className="lw-sn">{String(index + 1).padStart(2, "0")}</p>
                  <h3>{tr(`steps.${step.key}.title`)}</h3>
                  <p>
                    {tr(`steps.${step.key}.text`, {
                      pct: rules.passPct,
                      count: rules.maxAttempts,
                    })}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section aria-labelledby="cc-fmt-h" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="cc-fmt-h" className="v2-h2">
              {tr("formatHeading")}
            </h2>
            <p>{tr("formatIntro")}</p>
          </div>
          <div className="cc-fmt">
            <div className="cc-opt rec">
              <span className="cc-flagbadge">{tr("recommended")}</span>
              <div className="cc-oh">
                <span className="cc-ico" aria-hidden="true">
                  <MonitorSmartphoneIcon />
                </span>
                <div>
                  <h3>{tr("online.title")}</h3>
                  <p>{tr("online.sub")}</p>
                </div>
              </div>
              <p className="cc-price">
                <b>{formatUsd(online.priceCents, locale)}</b>
              </p>
              <p className="cc-cap">{tr("online.caption")}</p>
              <ul className="cc-chk">
                {(["c1", "c2", "c3", "c4"] as const).map((key) => (
                  <li key={key}>
                    <CheckIcon aria-hidden />
                    <span>{tr(`online.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <Link
                className="btn btn-primary btn-lg"
                href={buyHref(courseLanguage, account !== null)}
              >
                {tr("online.cta")}
              </Link>
              <p className="cc-foot">{tr("online.foot")}</p>
            </div>
            <div className="cc-opt cls">
              <div className="cc-oh">
                <span className="cc-ico" aria-hidden="true">
                  <SchoolIcon />
                </span>
                <div>
                  <h3>{tr("classroom.title")}</h3>
                  <p>{tr("classroom.sub")}</p>
                </div>
              </div>
              <p className="cc-price">
                <b>{formatUsd(classroom.priceCents, locale)}</b>
              </p>
              <p className="cc-cap">{tr("classroom.caption")}</p>
              <ul className="cc-chk">
                {(["c1", "c2", "c3", "c4"] as const).map((key) => (
                  <li key={key}>
                    <CheckIcon aria-hidden />
                    <span>{tr(`classroom.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <a className="btn btn-green btn-lg" href="#classroom">
                {tr("classroom.cta")}
              </a>
              <p className="cc-foot" aria-hidden="true"></p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="rules-heading" className="v2-section">
        <div className="v2-container">
          <div className="lw-head">
            <h2 id="rules-heading" className="v2-h2">
              {t("rulesHeading")}
            </h2>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-6">
            <li>
              {t("rules.exam", {
                questions: rules.examQuestions,
                pct: rules.passPct,
              })}
            </li>
            <li>{t("rules.attempts", { count: rules.maxAttempts })}</li>
            <li>{t("rules.quizzes")}</li>
            <li>{t("rules.minimumTime")}</li>
            <li>{t("rules.access", { days: rules.accessDays })}</li>
          </ul>
          <p className="mt-3">
            <Link
              href="/school-rules"
              className="font-medium text-link hover:underline"
            >
              {t("rulesLink")}
            </Link>
          </p>
          <h3 id="reporting-heading" className="mt-8 text-xl font-bold">
            {t("reportingHeading")}
          </h3>
          <p className="mt-2">
            {t("reportingText", {
              count: rules.reportTimes.length,
              times: new Intl.ListFormat(locale).format(rules.reportTimes),
            })}
          </p>
          <h3 id="refund-heading" className="mt-8 text-xl font-bold">
            {t("refundHeading")}
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>{t("refund.full")}</li>
            <li>{t("refund.half")}</li>
            <li>{t("refund.none")}</li>
          </ul>
          <p className="mt-3">
            <Link
              href="/refund-policy"
              className="font-medium text-link hover:underline"
            >
              {t("refundLink")}
            </Link>
          </p>
        </div>
      </section>

      {faq.length > 0 ? (
        <section aria-labelledby="cc-faq-h" className="v2-section">
          <div className="v2-container">
            <div className="lw-head">
              <h2 id="cc-faq-h" className="v2-h2">
                {tr("faqHeading")}
              </h2>
              <p>{tr("faqIntro")}</p>
            </div>
            <div className="lw-faq">
              <div className="v2-acc">
                <V2Accordion
                  items={faq.map((entry) => ({
                    id: entry.slug,
                    question: entry.title,
                    answer: <Markdown>{entry.body}</Markdown>,
                  }))}
                />
              </div>
            </div>
            <div className="lw-faq-more">
              <Link className="btn btn-secondary" href="/faq">
                {tr("faqAll")}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="classroom"
        aria-labelledby="classroom-heading"
        className="v2-section"
      >
        <div className="v2-container grid gap-6 rounded-2xl border bg-muted/40 p-6 md:grid-cols-2">
          <div>
            <h2
              id="classroom-heading"
              className="text-2xl font-bold tracking-tight"
            >
              {t("classroom.heading")}
            </h2>
            <p className="mt-2 text-2xl font-bold">
              {formatUsd(classroom.priceCents, locale)}
            </p>
            <p className="mt-2 text-muted-foreground">{t("classroom.text")}</p>
          </div>
          <LazyClassroomWaitlistForm
            counties={counties.map(({ slug, name }) => ({ slug, name }))}
          />
        </div>
      </section>

      <section aria-labelledby="cc-cta-h" className="v2-section">
        <div className="v2-container">
          <div className="lw-cta">
            <span className="v2-art">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="pic-day"
                src="/reference/art/certificate.webp"
                alt=""
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="pic-night"
                src="/reference/art/certificate-night.webp"
                alt=""
                aria-hidden="true"
              />
            </span>
            <div>
              <h2 id="cc-cta-h">{tr("ctaHeading")}</h2>
              <p>{tr("ctaText")}</p>
              <div className="lw-acts">
                <Link
                  className="btn btn-primary btn-lg"
                  href={buyHref(courseLanguage, account !== null)}
                >
                  {tr("ctaButton")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </V2Root>
  );
}

const STEPS = [
  { key: "choose", icon: LanguagesIcon },
  { key: "study", icon: BookOpenCheckIcon },
  { key: "exam", icon: ClipboardCheckIcon },
  { key: "file", icon: SendIcon },
] as const;
