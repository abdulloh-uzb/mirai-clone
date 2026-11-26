import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { contentPageMetadata } from "@/components/content/content-page";
import { Markdown } from "@/components/content/markdown";
import { NotTranslatedNotice } from "@/components/content/not-translated-notice";
import { V2Root } from "@/components/layout/page-hero";
import { AboutBody } from "@/components/ref/about-body";
import { routing } from "@/i18n/routing";
import { formatUsd, getOnlineCourse } from "@/lib/courses/courses";
import { getPage } from "@/lib/content/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  return contentPageMetadata("about", locale, "/about");
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [result, online] = await Promise.all([
    getPage("about", locale),
    getOnlineCourse(),
  ]);
  if (!result) notFound();

  return (
    <V2Root className="ab-page">
      <AboutBody values={{ price: formatUsd(online.priceCents, locale) }} />
      <section className="ab-sec">
        {result.isFallback ? <NotTranslatedNotice /> : null}
        <Markdown>{result.item.body}</Markdown>
      </section>
    </V2Root>
  );
}
