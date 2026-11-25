import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { AdaRequestForm } from "@/components/support/ada-request-form";
import { routing } from "@/i18n/routing";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { pageMetadata } from "@/lib/seo/page-metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/accessibility">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Accessibility" });
  return pageMetadata({
    locale,
    path: "/accessibility",
    title: t("title"),
    description: t("intro"),
  });
}

// TODO(ticket 02): the statement comes from the `pages` row `accessibility`
// once ticket 02 lands; until then it is a placeholder from the messages.
export default async function AccessibilityPage() {
  const [t, account] = await Promise.all([
    getTranslations("Accessibility"),
    getCurrentAccount(),
  ]);

  return (
    <section className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{t("intro")}</p>
      <p className="mt-4">{t("statement")}</p>
      <h2 className="mt-10 text-xl font-semibold">{t("formHeading")}</h2>
      <div className="mt-4">
        <AdaRequestForm accountEmail={account?.email} />
      </div>
    </section>
  );
}
