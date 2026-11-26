import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { PageHero, V2Root } from "@/components/layout/page-hero";
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

  const { contact } = siteConfig;
  return (
    <V2Root className="ct-page">
      <PageHero title={t("title")} intro={t("intro")} art="contact">
        <div className="cn-acts">
          <a className="btn btn-primary btn-lg" href={contact.phoneHref}>
            <span>{contact.phone}</span>
          </a>
          <a
            className="btn btn-secondary btn-lg"
            href={`mailto:${contact.email}`}
          >
            <span>{contact.email}</span>
          </a>
        </div>
      </PageHero>
      <section className="cn-work">
        <div className="cn-work-in">
          <aside aria-labelledby="contact-details">
            <h2 id="contact-details" className="cn-h">
              {t("detailsHeading")}
            </h2>
            <address className="ct-fix not-italic">
              <span className="ct-fix-t">
                <span>{siteConfig.name}</span>
                {contact.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <a href={contact.phoneHref}>{contact.phone}</a>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </span>
            </address>
          </aside>
          <div className="ct-main">
            <ContactForm accountEmail={account?.email} />
          </div>
        </div>
      </section>
    </V2Root>
  );
}
