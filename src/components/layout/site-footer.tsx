import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { PrivacyChoicesButton } from "@/components/privacy/cookie-consent";
import { ReportProblem } from "@/components/support/report-problem";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { footerNav } from "./nav-links";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const links = footerNav.flatMap((group) => [...group.links]);

  return (
    <footer className="mt-16 px-3 pb-3">
      <div className="mx-auto max-w-[1440px] rounded-3xl border border-white/85 bg-white/95 px-6 py-6 shadow-md dark:border-white/10 dark:bg-card">
        <nav aria-label={t("nav")}>
          <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[13px] font-semibold">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-2.5 py-1.5 text-[#424751] hover:bg-accent hover:text-foreground dark:text-muted-foreground"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <li>
              <PrivacyChoicesButton className="block rounded-lg px-2.5 py-1.5 text-[#424751] hover:bg-accent hover:text-foreground dark:text-muted-foreground" />
            </li>
            <li>
              <ReportProblem className="rounded-lg px-2.5 py-1.5 text-[#0a52b8] underline dark:text-primary" />
            </li>
          </ul>
        </nav>

        <div className="mt-5 flex flex-col gap-4 border-t pt-5 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <address className="flex flex-col gap-1 not-italic">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <CheckIcon
                aria-hidden
                className="size-4 rounded-full bg-brand-green p-0.5 text-[#0f1217]"
              />
              {siteConfig.name}
            </span>
            <span>{t("license", { number: siteConfig.licenseNumber })}</span>
            {siteConfig.contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <a
              href={siteConfig.contact.phoneHref}
              className="hover:text-foreground"
            >
              {siteConfig.contact.phone}
            </a>
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="hover:text-foreground"
            >
              {siteConfig.contact.email}
            </a>
          </address>
          <div className="flex flex-col gap-1 text-xs sm:items-end sm:text-right">
            <p>{t("copyright", { year, name: siteConfig.name })}</p>
            <p className="font-semibold text-foreground">{t("demoNotice")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
