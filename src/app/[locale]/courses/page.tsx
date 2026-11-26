import { PageHero } from "@/components/layout/page-hero";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClassroomWaitlistForm } from "@/components/courses/classroom-waitlist-form";
import { CitationStateSelector } from "@/components/courses/citation-state-selector";
import { CoursePanel } from "@/components/courses/course-panel";
import { LanguageCards } from "@/components/courses/language-cards";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getTicketState } from "@/lib/citation-state.server";
import { parseCourseLanguage } from "@/lib/courses/course-language";
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

  const [t, account, online, classroom, rules, states, ticketState, counties] =
    await Promise.all([
      getTranslations({ locale, namespace: "Courses" }),
      getCurrentAccount(),
      getOnlineCourse(),
      getClassroomCourse(),
      getCourseRules(),
      listStates(),
      getTicketState(),
      listCounties(),
    ]);

  return (
    <>
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
      <PageHero title={t("title")} intro={t("intro")}>
        <div className="mt-6">
          <CitationStateSelector states={states} current={ticketState} />
        </div>
      </PageHero>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <LanguageCards selected={courseLanguage} />
          <CoursePanel
            courseLanguage={courseLanguage}
            locale={locale}
            signedIn={account !== null}
            priceCents={online.priceCents}
            listPriceCents={online.listPriceCents}
            accessDays={rules.accessDays}
          />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-2">
          <section aria-labelledby="syllabus-heading">
            <h2
              id="syllabus-heading"
              className="text-2xl font-bold tracking-tight"
            >
              {t("syllabusHeading")}
            </h2>
            <ol className="mt-4 grid gap-2">
              {online.sections.map((section) => (
                <li
                  key={section.position}
                  className="flex gap-3 rounded-lg border bg-card px-4 py-3"
                >
                  <span className="font-bold text-link">
                    {section.position}
                  </span>
                  {section.title[locale] ?? section.title.en}
                </li>
              ))}
            </ol>
          </section>

          <div className="grid content-start gap-12">
            <section aria-labelledby="rules-heading">
              <h2
                id="rules-heading"
                className="text-2xl font-bold tracking-tight"
              >
                {t("rulesHeading")}
              </h2>
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
              <Link
                href="/school-rules"
                className="mt-3 inline-block font-medium text-link hover:underline"
              >
                {t("rulesLink")}
              </Link>
            </section>

            <section aria-labelledby="reporting-heading">
              <h2
                id="reporting-heading"
                className="text-2xl font-bold tracking-tight"
              >
                {t("reportingHeading")}
              </h2>
              <p className="mt-4">
                {t("reportingText", {
                  count: rules.reportTimes.length,
                  times: new Intl.ListFormat(locale).format(rules.reportTimes),
                })}
              </p>
            </section>

            <section aria-labelledby="refund-heading">
              <h2
                id="refund-heading"
                className="text-2xl font-bold tracking-tight"
              >
                {t("refundHeading")}
              </h2>
              <ul className="mt-4 list-disc space-y-1 pl-6">
                <li>{t("refund.full")}</li>
                <li>{t("refund.half")}</li>
                <li>{t("refund.none")}</li>
              </ul>
              <Link
                href="/refund-policy"
                className="mt-3 inline-block font-medium text-link hover:underline"
              >
                {t("refundLink")}
              </Link>
            </section>
          </div>
        </div>

        <section
          id="classroom"
          aria-labelledby="classroom-heading"
          className="mt-16 grid gap-6 rounded-2xl border bg-muted/40 p-6 md:grid-cols-2"
        >
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
          <ClassroomWaitlistForm
            counties={counties.map(({ slug, name }) => ({ slug, name }))}
          />
        </section>
      </div>
    </>
  );
}
