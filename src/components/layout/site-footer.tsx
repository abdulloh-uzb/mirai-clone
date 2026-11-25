import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { footerNav } from "./nav-links";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <nav aria-label={t("nav")} className="contents">
          {footerNav.map((group) => (
            <div key={group.key}>
              <h2 className="text-sm font-semibold">{t(group.key)}</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-muted-foreground hover:text-foreground"
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div>
          <h2 className="text-sm font-semibold">{t("contactHeading")}</h2>
          <address className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground not-italic">
            <span>{siteConfig.name}</span>
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
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>{t("copyright", { year, name: siteConfig.name })}</p>
          <p className="font-medium text-foreground">{t("demoNotice")}</p>
        </div>
      </div>
    </footer>
  );
}
