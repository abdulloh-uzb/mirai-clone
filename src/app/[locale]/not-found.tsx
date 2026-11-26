import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { NotFoundContent } from "@/components/layout/not-found-content";
import { SiteFrame } from "@/components/layout/site-frame";
import { routing } from "@/i18n/routing";

/** Reached when a layout above `(site)` calls `notFound()` (the Admin layout for a non-Admin). Draws the public frame itself. */
export default async function LocaleNotFound() {
  const current = await getLocale();
  const locale = hasLocale(routing.locales, current)
    ? current
    : routing.defaultLocale;
  return (
    <SiteFrame locale={locale}>
      <NotFoundContent />
    </SiteFrame>
  );
}
