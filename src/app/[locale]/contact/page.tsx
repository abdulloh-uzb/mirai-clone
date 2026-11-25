import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/layout/page-hero";
import { ContactForm } from "@/components/support/contact-form";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Contact" });
  return pageMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("intro"),
  });
}

export default async function ContactPage() {
  const [t, account] = await Promise.all([
    getTranslations("Contact"),
    getCurrentAccount(),
  ]);

  return (
    <>
      <PageHero title={t("title")} intro={t("intro")} />
      <section className="mx-auto grid w-full max-w-4xl gap-10 px-4 py-12 md:grid-cols-[3fr_2fr]">
        <div>
          <ContactForm accountEmail={account?.email} />
        </div>
        <aside aria-labelledby="contact-details">
          <h2 id="contact-details" className="text-lg font-semibold">
            {t("detailsHeading")}
          </h2>
          <address className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground not-italic">
            <span>{siteConfig.name}</span>
            {siteConfig.contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <a
              href={siteConfig.contact.phoneHref}
              className="underline hover:text-foreground"
            >
              {siteConfig.contact.phone}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="underline hover:text-foreground"
            >
              {siteConfig.contact.email}
            </a>
          </address>
        </aside>
      </section>
    </>
  );
}
