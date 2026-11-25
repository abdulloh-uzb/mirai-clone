import {
  AwardIcon,
  BookOpenIcon,
  CheckIcon,
  ClipboardCheckIcon,
  SendIcon,
  SparklesIcon,
  UserPlusIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/content/markdown";
import { CitationStateSelector } from "@/components/courses/citation-state-selector";
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

const sectionHeading = "text-3xl font-bold tracking-tight text-balance";

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
      <section className="bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm font-medium">
              {t("hero.badge", { license: siteConfig.licenseNumber })}
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 text-lg text-pretty text-muted-foreground">
              {t("hero.intro")}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-4xl font-bold">{price}</span>
              {listPrice ? (
                <s className="text-xl text-muted-foreground">
                  <span className="sr-only">{t("hero.listPrice")} </span>
                  {listPrice}
                </s>
              ) : null}
              {saving ? (
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                  {t("hero.save", { amount: saving })}
                </span>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={enrollHref}
                className={buttonVariants({ size: "lg" })}
              >
                {t("hero.enroll")}
              </Link>
              <Link
                href="/courses"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                {t("hero.explore")}
              </Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {(["languages", "access", "payments"] as const).map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  <CheckIcon aria-hidden className="size-4 text-emerald-600" />
                  {t(`hero.trust.${key}`, { days: rules.accessDays })}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <CitationStateSelector states={states} current={ticketState} />
            </div>
          </div>
          <Image
            src="/placeholder/hero-road.svg"
            alt={t("hero.imageAlt")}
            width={640}
            height={400}
            preload
            unoptimized
            className="h-auto w-full rounded-3xl"
          />
        </div>
      </section>

      {/* 2. How it works */}
      <section
        aria-labelledby="how-heading"
        className="mx-auto max-w-6xl px-4 py-16"
      >
        <h2 id="how-heading" className={sectionHeading}>
          {t("stepsHeading")}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="rounded-xl border bg-card p-5">
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <Icon aria-hidden className="size-5 text-primary" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Course card */}
      <section
        aria-labelledby="course-heading"
        className="mx-auto max-w-6xl px-4 py-8"
      >
        <div className="grid gap-6 rounded-2xl border bg-card p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2
              id="course-heading"
              className="text-2xl font-bold tracking-tight"
            >
              {t("course.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("course.text")}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <CheckIcon aria-hidden className="size-4 text-primary" />
                {t("course.access", { days: rules.accessDays })}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon aria-hidden className="size-4 text-primary" />
                {t("course.interactive")}
              </li>
              <li className="flex items-center gap-2">
                <SendIcon aria-hidden className="size-4 text-primary" />
                {t("course.reported")}
              </li>
            </ul>
          </div>
          <Link href="/courses" className={buttonVariants({ size: "lg" })}>
            {t("course.cta")}
          </Link>
        </div>
      </section>

      {/* 4. Court finder teaser */}
      <section
        aria-labelledby="courts-heading"
        className="mx-auto max-w-6xl px-4 py-16"
      >
        <h2 id="courts-heading" className={sectionHeading}>
          {t("courts.heading")}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t("courts.text")}
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {popular.map((county) => (
            <li key={county.slug}>
              <Link
                href={`/courts/${county.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border bg-card px-4 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {county.name}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href="/courts"
            className="font-medium text-primary hover:underline"
          >
            {t("courts.all", { count: counties.length })}
          </Link>
          <Link
            href="/eligibility"
            className="font-medium text-primary hover:underline"
          >
            {t("courts.eligibility")}
          </Link>
        </div>
      </section>

      {/* 5. Pricing */}
      <section aria-labelledby="pricing-heading" className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 id="pricing-heading" className={sectionHeading}>
            {t("pricing.heading")}
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                {t("pricing.onlineTitle")}
              </h3>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{price}</span>
                {listPrice ? (
                  <s className="text-muted-foreground">
                    <span className="sr-only">{t("hero.listPrice")} </span>
                    {listPrice}
                  </s>
                ) : null}
              </p>
              <ul className="mt-4 grid gap-2">
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
                      className="mt-1 size-4 shrink-0 text-emerald-600"
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
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
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
                      <td className="py-2 font-bold">{amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Link
                href="/refund-policy"
                className="mt-4 inline-block font-medium text-primary hover:underline"
              >
                {t("pricing.refundLink")}
              </Link>
            </div>
            <div className="rounded-2xl border border-dashed bg-card p-6">
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
        <div className="grid gap-4 rounded-2xl bg-primary p-8 text-primary-foreground md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2
              id="ai-heading"
              className="flex items-center gap-2 text-2xl font-bold tracking-tight"
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
              className="group rounded-xl border bg-card px-5 py-4"
            >
              <summary className="cursor-pointer font-semibold">
                {entry.title}
              </summary>
              <Markdown className="text-muted-foreground">
                {entry.body}
              </Markdown>
              <Link
                href={{ pathname: "/faq", hash: entry.slug }}
                className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
              >
                {t("faq.permalink")}
              </Link>
            </details>
          ))}
        </div>
        <Link
          href="/faq"
          className="mt-6 inline-block font-medium text-primary hover:underline"
        >
          {t("faq.all")}
        </Link>
      </section>

      {/* 9. Final call to action */}
      <section aria-labelledby="final-heading" className="border-t bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 id="final-heading" className={sectionHeading}>
            {t("final.heading")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("final.text", { price })}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={enrollHref} className={buttonVariants({ size: "lg" })}>
              {t("hero.enroll")}
            </Link>
            <Link
              href="/eligibility"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              {t("final.eligibility")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
