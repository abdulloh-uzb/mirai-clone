import {
  AwardIcon,
  BookOpenIcon,
  CheckIcon,
  ClipboardCheckIcon,
  SendIcon,
  SparklesIcon,
  StarIcon,
  UserPlusIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/markdown";
import { CitationStateSelector } from "@/components/courses/citation-state-selector";
import { HeroScene } from "@/components/home/hero-scene";
import { ReviewsMarquee } from "@/components/home/reviews-marquee";
import { ReviewsCarousel } from "@/components/home/reviews-carousel";
import { JsonLd } from "@/components/seo/json-ld";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

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

const sectionHeading =
  "text-3xl font-extrabold tracking-tight text-balance sm:text-4xl";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const [
    t,
    account,
    online,
    classroom,
    rules,
    states,
    ticketState,
    counties,
    faq,
    reviews,
  ] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getCurrentAccount(),
    getOnlineCourse(),
    getClassroomCourse(),
    getCourseRules(),
    listStates(),
    getTicketState(),
    listCounties(),
    listFeaturedFaq(locale),
    listReviews(locale),
  ]);

  const price = formatUsd(online.priceCents, locale);
  const listPrice = online.listPriceCents
    ? formatUsd(online.listPriceCents, locale)
    : null;
  const saving =
    online.listPriceCents && online.listPriceCents > online.priceCents
      ? formatUsd(online.listPriceCents - online.priceCents, locale)
      : null;
  const enrollHref = buyHref(locale, account !== null);
  const popular = counties
    .filter((county) => county.popularRank !== null)
    .sort((a, b) => (a.popularRank ?? 0) - (b.popularRank ?? 0));
  const average = averageRating(reviews);
  const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL;

  const steps = [
    {
      icon: UserPlusIcon,
      title: t("steps.signUp.title"),
      text: t("steps.signUp.text"),
    },
    {
      icon: BookOpenIcon,
      title: t("steps.learn.title"),
      text: t("steps.learn.text"),
    },
    {
      icon: ClipboardCheckIcon,
      title: t("steps.exam.title"),
      text: t("steps.exam.text", {
        questions: rules.examQuestions,
        pct: rules.passPct,
        attempts: rules.maxAttempts,
      }),
    },
    {
      icon: AwardIcon,
      title: t("steps.certificate.title"),
      text: t("steps.certificate.text"),
    },
  ];

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

      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full md:w-[65%]">
          <HeroScene label={t("hero.imageAlt")} />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent md:via-background/70"
        />
        <div className="relative mx-auto max-w-[1440px] px-6 py-16 md:py-28 lg:px-16">
          <div className="max-w-[800px]">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CheckIcon
                aria-hidden
                className="size-5 rounded-full bg-brand-green p-0.5 text-[#0f1217]"
              />
              {t("hero.badge", { license: siteConfig.licenseNumber })}
            </p>
            <h1 className="mt-5 text-[clamp(2.5rem,6vw+1rem,4.5rem)] leading-[1.05] font-extrabold tracking-[-0.025em] text-balance">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
              {t("hero.intro")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-5xl font-extrabold">{price}</span>
              {listPrice ? (
                <s className="text-[22px] text-muted-foreground">
                  <span className="sr-only">{t("hero.listPrice")} </span>
                  {listPrice}
                </s>
              ) : null}
              {saving ? (
                <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-extrabold tracking-wide text-[#0f1217] uppercase">
                  {t("hero.save", { amount: saving })}
                </span>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={enrollHref}
                className={buttonVariants({ size: "xl" })}
              >
                {t("hero.enroll")}
              </Link>
              <Link
                href="/courses"
                className={buttonVariants({ size: "xl", variant: "outline" })}
              >
                {t("hero.explore")}
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
              {(["languages", "access", "payments"] as const).map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  <CheckIcon
                    aria-hidden
                    className="size-4 text-brand-green-ink"
                  />
                  {t(`hero.trust.${key}`, { days: rules.accessDays })}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <CitationStateSelector states={states} current={ticketState} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. How it works: checkered banner, then alternating sky and mint bands */}
      <section aria-labelledby="how-heading">
        <div aria-hidden className="checker-edge h-3.5" />
        <div className="bg-surface-peach py-10 text-center">
          <h2
            id="how-heading"
            className="mx-auto max-w-3xl px-4 text-3xl font-extrabold tracking-tight text-balance"
          >
            {t("stepsHeading")}
          </h2>
        </div>
        <div aria-hidden className="checker-edge h-3.5" />
        <ol>
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className={cn(
                "py-12 md:py-20",
                index % 2 === 0 ? "bg-surface-sky" : "bg-surface-mint",
              )}
            >
              <div
                className={cn(
                  "mx-auto grid max-w-[1200px] items-center gap-6 px-6 md:grid-cols-2",
                  index % 2 === 1 && "md:[&>*:first-child]:order-2",
                )}
              >
                <div>
                  <span
                    aria-hidden
                    className="block text-[clamp(5rem,12vw,7.5rem)] leading-none font-extrabold text-brand-green"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-2 text-3xl font-extrabold tracking-tight">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-md text-lg text-muted-foreground">
                    {text}
                  </p>
                </div>
                <div
                  aria-hidden
                  className="mx-auto grid size-40 place-items-center rounded-[28px] bg-card text-brand-green-ink shadow-md md:size-56"
                >
                  <Icon className="size-16 md:size-24" strokeWidth={1.5} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Course card */}
      <section
        aria-labelledby="course-heading"
        className="mx-auto max-w-6xl px-4 py-8"
      >
        <div className="grid gap-6 rounded-3xl border-2 bg-surface-sky p-6 shadow-md md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <h2
              id="course-heading"
              className="text-3xl font-extrabold tracking-tight"
            >
              {t("course.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("course.text")}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <CheckIcon
                  aria-hidden
                  className="size-5 rounded-full bg-brand-green p-0.5 text-[#0f1217]"
                />
                {t("course.access", { days: rules.accessDays })}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon
                  aria-hidden
                  className="size-5 rounded-full bg-brand-green p-0.5 text-[#0f1217]"
                />
                {t("course.interactive")}
              </li>
              <li className="flex items-center gap-2">
                <SendIcon
                  aria-hidden
                  className="size-5 rounded-full bg-brand-green p-1 text-[#0f1217]"
                />
                {t("course.reported")}
              </li>
            </ul>
          </div>
          <Link href="/courses" className={buttonVariants({ size: "xl" })}>
            {t("course.cta")}
          </Link>
        </div>
      </section>

      {/* 4. Court finder teaser */}
      <section
        aria-labelledby="courts-heading"
        className="mx-auto max-w-6xl px-4 py-16"
      >
        <div className="rounded-3xl border-2 bg-card p-6 shadow-md md:p-10">
          <h2 id="courts-heading" className={sectionHeading}>
            {t("courts.heading")}
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t("courts.text")}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {popular.map((county) => (
              <li key={county.slug}>
                <Link
                  href={`/courts/${county.slug}`}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border-2 border-b-4 border-b-brand-green bg-card px-5 text-base font-bold shadow-sm transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {county.name}
                  <span aria-hidden className="text-brand-green-ink">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/courts"
              className="font-medium text-link hover:underline"
            >
              {t("courts.all", { count: counties.length })}
            </Link>
            <Link
              href="/eligibility"
              className="font-medium text-link hover:underline"
            >
              {t("courts.eligibility")}
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Pricing */}
      <section aria-labelledby="pricing-heading" className="bg-surface-mint">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="pricing-heading" className={sectionHeading}>
            {t("pricing.heading")}
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border-2 bg-surface-peach p-6 shadow-md">
              <h3 className="text-lg font-extrabold">
                {t("pricing.onlineTitle")}
              </h3>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold">{price}</span>
                {listPrice ? (
                  <s className="text-muted-foreground">
                    <span className="sr-only">{t("hero.listPrice")} </span>
                    {listPrice}
                  </s>
                ) : null}
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {(
                  [
                    "lessons",
                    "exam",
                    "certificate",
                    "reporting",
                    "support",
                  ] as const
                ).map((key) => (
                  <li key={key} className="flex items-start gap-2">
                    <CheckIcon
                      aria-hidden
                      className="mt-1 size-4 shrink-0 text-brand-green-ink"
                    />
                    {t(`pricing.includes.${key}`, { days: rules.accessDays })}
                  </li>
                ))}
              </ul>
              <Link
                href={enrollHref}
                className={buttonVariants({ className: "mt-6 w-full" })}
              >
                {t("hero.enroll")}
              </Link>
            </div>
            <div className="rounded-3xl border-2 bg-card p-6 shadow-md">
              <h3 className="text-lg font-extrabold">
                {t("pricing.refundTitle")}
              </h3>
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th scope="col" className="py-2 pr-2 font-semibold">
                      {t("pricing.refundWhen")}
                    </th>
                    <th scope="col" className="py-2 font-semibold">
                      {t("pricing.refundAmount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["full", "100%"],
                      ["half", "50%"],
                      ["none", "0%"],
                    ] as const
                  ).map(([key, amount]) => (
                    <tr key={key} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        {t(`pricing.refund.${key}`)}
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-brand-green px-3 py-1 text-sm font-extrabold text-[#0f1217]">
                          {amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href="/refund-policy"
                className="mt-4 inline-block font-medium text-link hover:underline"
              >
                {t("pricing.refundLink")}
              </Link>
            </div>
            <div className="rounded-3xl border-2 border-dashed bg-surface-sky p-6">
              <h3 className="text-lg font-semibold">
                {t("pricing.classroomTitle")}
              </h3>
              <p className="mt-2 text-3xl font-bold">
                {formatUsd(classroom.priceCents, locale)}
              </p>
              <p className="mt-2 text-muted-foreground">
                {t("pricing.classroomText")}
              </p>
              <Link
                href={{ pathname: "/courses", hash: "classroom" }}
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-6 w-full",
                })}
              >
                {t("pricing.classroomCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Reviews */}
      {reviews.length > 0 ? (
        <section
          aria-labelledby="reviews-heading"
          className="mx-auto max-w-6xl px-4 py-16"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="reviews-heading" className={sectionHeading}>
                {t("reviews.heading")}
              </h2>
              {average !== null ? (
                <p className="mt-2 text-muted-foreground">
                  {t("reviews.average", {
                    rating: average,
                    count: reviews.length,
                  })}
                </p>
              ) : null}
            </div>
            {reviews.some((review) => review.isSample) ? (
              <p className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-sm font-medium">
                {t("reviews.sampleLabel")}
              </p>
            ) : null}
          </div>
          {average !== null ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-3xl border-2 bg-surface-peach p-6 shadow-md">
              <span className="text-6xl font-extrabold">{average}</span>
              <span aria-hidden className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }, (_, star) => (
                  <StarIcon
                    key={star}
                    className={cn(
                      "size-7",
                      star < Math.round(average) && "fill-current",
                    )}
                  />
                ))}
              </span>
              <span className="text-muted-foreground">
                {t("reviews.average", {
                  rating: average,
                  count: reviews.length,
                })}
              </span>
            </div>
          ) : null}
          <ReviewsMarquee reviews={reviews} />
          <div className="mt-8">
            <ReviewsCarousel reviews={reviews} />
          </div>
        </section>
      ) : null}

      {/* 7. AI assistant teaser */}
      <section
        aria-labelledby="ai-heading"
        className="mx-auto max-w-6xl px-4 py-8"
      >
        <div className="relative grid gap-4 overflow-hidden rounded-3xl bg-brand-navy p-8 text-white shadow-lg md:grid-cols-[1fr_auto] md:items-center md:p-10 dark:bg-surface-sky dark:text-foreground">
          <div
            aria-hidden
            className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-sky/30"
          />
          <div>
            <h2
              id="ai-heading"
              className="relative flex items-center gap-2 text-3xl font-extrabold tracking-tight text-white dark:text-foreground"
            >
              <SparklesIcon aria-hidden className="size-6" />
              {t("ai.heading")}
            </h2>
            <p className="mt-2 opacity-90">{t("ai.text")}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            disabled
            aria-describedby="ai-soon"
          >
            {t("ai.cta")}
          </Button>
          <p id="ai-soon" className="text-sm opacity-90 md:col-span-2">
            {t("ai.soon")}
          </p>
        </div>
      </section>

      {/* 8. Short FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="mx-auto max-w-3xl px-4 py-16"
      >
        <h2 id="faq-heading" className={sectionHeading}>
          {t("faq.heading")}
        </h2>
        <div className="mt-6 grid gap-3">
          {faq.map((entry) => (
            <details
              key={entry.slug}
              className="group rounded-2xl border-2 bg-card px-5 py-4 shadow-sm open:border-brand-green"
            >
              <summary className="cursor-pointer text-lg font-bold">
                {entry.title}
              </summary>
              <Markdown className="text-muted-foreground">
                {entry.body}
              </Markdown>
              <Link
                href={{ pathname: "/faq", hash: entry.slug }}
                className="mt-3 inline-block text-sm font-medium text-link hover:underline"
              >
                {t("faq.permalink")}
              </Link>
            </details>
          ))}
        </div>
        <Link
          href="/faq"
          className="mt-6 inline-block font-medium text-link hover:underline"
        >
          {t("faq.all")}
        </Link>
      </section>

      {/* 9. Final call to action: scene with an overlapping card */}
      <section
        aria-labelledby="final-heading"
        className="relative overflow-hidden bg-gradient-to-b from-surface-sky to-surface-mint px-4 pt-16 pb-24"
      >
        <svg
          aria-hidden
          viewBox="0 0 1200 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-40 w-full"
        >
          <path
            d="M0 90 Q200 20 420 80 T860 70 T1200 60 V200 H0Z"
            fill="#9be07a"
            opacity="0.6"
          />
          <path
            d="M0 140 Q300 80 600 130 T1200 120 V200 H0Z"
            fill="#58b947"
            opacity="0.7"
          />
        </svg>
        <div className="relative mx-auto max-w-3xl rounded-3xl bg-card p-8 text-center shadow-lg md:p-12">
          <h2 id="final-heading" className={sectionHeading}>
            {t("final.heading")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("final.text", { price })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={enrollHref} className={buttonVariants({ size: "xl" })}>
              {t("hero.enroll")}
            </Link>
            <Link
              href="/eligibility"
              className={cn(buttonVariants({ size: "xl", variant: "outline" }))}
            >
              {t("final.eligibility")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
