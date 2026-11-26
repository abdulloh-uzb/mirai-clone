import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ContentPage,
  contentPageMetadata,
} from "@/components/content/content-page";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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
  const [result, t] = await Promise.all([
    getPage("about", locale),
    getTranslations({ locale, namespace: "About" }),
  ]);
  if (!result) notFound();
  const { contact } = siteConfig;

  // Contact details come from siteConfig, never from the database text.
  return (
    <ContentPage result={result} hero>
      <section
        aria-labelledby="about-contact"
        className="mt-10 rounded-xl border bg-card p-6"
      >
        <h2 id="about-contact" className="text-2xl font-bold tracking-tight">
          {t("contactHeading")}
        </h2>
        <address className="mt-4 grid gap-1 not-italic">
          <span className="font-semibold">{siteConfig.name}</span>
          {contact.addressLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
          <a href={contact.phoneHref} className="text-link hover:underline">
            {contact.phone}
          </a>
          <a
            href={`mailto:${contact.email}`}
            className="text-link hover:underline"
          >
            {contact.email}
          </a>
        </address>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("license", { number: siteConfig.licenseNumber })}
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block font-medium text-link hover:underline"
        >
          {t("contactLink")}
        </Link>
      </section>
    </ContentPage>
  );
}
