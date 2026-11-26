import { ChevronRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CitationStateSelector } from "@/components/courses/citation-state-selector";
import { Markdown } from "@/components/content/markdown";
import { HomeBody } from "@/components/ref/home-body";
import { V2Accordion } from "@/components/ref/ref-client";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { getTicketState } from "@/lib/citation-state.server";
import { buyHref } from "@/lib/courses/course-language";
import {
  formatUsd,
  getClassroomCourse,
  getCourseRules,
  getOnlineCourse,
  listStates,
} from "@/lib/courses/courses";
import { listCounties } from "@/lib/courts/counties";
import { publicEnv } from "@/lib/env";
import { listFeaturedFaq } from "@/lib/faq/faq";
import { aggregateRating, averageRating } from "@/lib/reviews/rating";
import { listReviews } from "@/lib/reviews/reviews";
import { course, educationalOrganization } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    ...pageMetadata({
      locale,
      path: "/",
      title: t("title", { name: siteConfig.name }),
      description: t("description"),
    }),
    // The home page title is the full site title, without the layout template.
    title: { absolute: t("title", { name: siteConfig.name }) },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [
    t,
    tShared,
    account,
    online,
    classroom,
    rules,
    counties,
    faq,
    reviews,
    states,
    ticketState,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getTranslations({ locale, namespace: "Ref.shared" }),
    getCurrentAccount(),
    getOnlineCourse(),
    getClassroomCourse(),
    getCourseRules(),
    listCounties(),
    listFeaturedFaq(locale),
    listReviews(locale),
    listStates(),
    getTicketState(),
  ]);

  const price = formatUsd(online.priceCents, locale);
  const listPrice = online.listPriceCents
    ? formatUsd(online.listPriceCents, locale)
    : price;
  const saving =
    online.listPriceCents && online.listPriceCents > online.priceCents
      ? formatUsd(online.listPriceCents - online.priceCents, locale)
      : formatUsd(0, locale);
  const enrollHref = buyHref(locale, account !== null);
  const popular = counties
    .filter((county) => county.popularRank !== null)
    .sort((a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0));
  const average = averageRating(reviews);
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

  const slots = {
    heroExtra: (
      <div className="mt-6">
        <CitationStateSelector states={states} current={ticketState} />
      </div>
    ),
    classroomAction: (
      <Link
        className="linkish"
        href={{ pathname: "/courses", hash: "classroom" }}
      >
        {t("pricing.classroomCta")}
      </Link>
    ),
    reviews: reviews.map((review) => (
      <figure className="rvf-card" key={review.slug}>
        <p>“{review.body}”</p>
        <b>{review.authorName}</b>
      </figure>
    )),
    counties: popular.map((county) => (
      <li key={county.slug}>
        <Link className="flat-row" href={`/courts/${county.slug}`}>
          <span className="fr-t">
            <b>{county.name}</b>
            <span>
              {tShared("courtsCount", { count: county.courthouses.length })}
            </span>
          </span>
          <ChevronRightIcon aria-hidden />
        </Link>
      </li>
    )),
    faq: (
      <V2Accordion
        items={faq.map((entry) => ({
          id: entry.slug,
          question: entry.title,
          answer: <Markdown>{entry.body}</Markdown>,
        }))}
      />
    ),
  };

  return (
    <>
      <JsonLd
        data={educationalOrganization({
          siteUrl,
          locale,
          name: siteConfig.name,
          email: siteConfig.contact.email,
          telephone: siteConfig.contact.phone,
          // Sample reviews never count, so there is no rating for now.
          rating: aggregateRating(reviews),
        })}
      />
      <JsonLd
        data={course({
          siteUrl,
          locale,
          name: t("course.title"),
          description: t("course.text"),
          path: "/courses",
          priceCents: online.priceCents,
          providerName: siteConfig.name,
          languages: routing.locales,
        })}
      />
      <div className="v2 v2-root">
        <HomeBody
          locale={locale}
          enrollHref={enrollHref}
          enrollHrefs={{
            en: buyHref("en", account !== null),
            ja: buyHref("ja", account !== null),
            es: buyHref("es", account !== null),
            ru: buyHref("ru", account !== null),
          }}
          slots={slots}
          values={{
            price,
            listPrice,
            saving,
            days: rules.accessDays,
            questions: rules.examQuestions,
            pct: rules.passPct,
            attempts: rules.maxAttempts,
            count: counties.length,
            classroomPrice: formatUsd(classroom.priceCents, locale),
            rating: average ?? "",
          }}
        />
      </div>
    </>
  );
}
