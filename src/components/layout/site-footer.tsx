import { CheckIcon, MailIcon, PhoneIcon, SignpostIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { PrivacyChoicesButton } from "@/components/privacy/cookie-consent";
import { ReportProblem } from "@/components/support/report-problem";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { footerNav } from "./nav-links";

/** The reference footer (`.ftr.ftB`): logo and links on top, licence, address, phone, email and copyright below. */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const links = footerNav.flatMap((group) => [...group.links]);
  const [localPart, domain] = siteConfig.contact.email.split("@");

  return (
    <div className="v2 v2-contents">
      <footer className="ftr ftB" id="contact">
        <div className="ftB-bar">
          <div className="ftB-in">
            <div className="ftB-r1">
              <span className="logo lg-l">
                <span aria-hidden className="logo-mark">
                  <SignpostIcon />
                </span>
                <span className="logo-word">{siteConfig.shortName}</span>
              </span>
              <nav className="ftB-nav" aria-label={t("nav")}>
                {links.map((link) => (
                  <Link key={link.key} href={link.href}>
                    {t(link.key)}
                  </Link>
                ))}
                <PrivacyChoicesButton />
                <ReportProblem />
              </nav>
            </div>
            <div className="ftB-r2">
              <span className="ftB-lic">
                <CheckIcon aria-hidden />
                {t("license", { number: siteConfig.licenseNumber })}
              </span>
              <span>{siteConfig.contact.addressLines.join(", ")}</span>
              <a className="ftB-tel" href={siteConfig.contact.phoneHref}>
                <PhoneIcon aria-hidden />
                {siteConfig.contact.phone}
              </a>
              <a
                className="ftB-mail"
                href={`mailto:${siteConfig.contact.email}`}
                title={siteConfig.contact.email}
              >
                <MailIcon aria-hidden />
                <span>
                  {localPart}@<wbr />
                  {domain}
                </span>
              </a>
              <span className="ftB-cp">
                {t("copyright", { year, name: siteConfig.name })}
              </span>
              <span className="ftB-cp">{t("demoNotice")}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
