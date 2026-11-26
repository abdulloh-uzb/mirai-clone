import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/verify">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Verify" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** The check form. Submitting it (no JavaScript needed) goes to /verify/<number>. */
export default async function VerifyIndexPage({
  params,
  searchParams,
}: PageProps<"/[locale]/verify">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { cert } = await searchParams;
  const number = typeof cert === "string" ? cert.trim().slice(0, 40) : "";
  if (number) {
    redirect(
      getPathname({
        href: `/verify/${encodeURIComponent(number)}`,
        locale,
      }),
    );
  }
  const t = await getTranslations({ locale, namespace: "Verify" });
  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("intro")}</p>
      <form className="mt-8 space-y-3">
        <label htmlFor="cert" className="block text-sm font-medium">
          {t("label")}
        </label>
        <input
          id="cert"
          name="cert"
          required
          className="w-full rounded-md border bg-background px-3 py-2 font-mono"
        />
        <Button type="submit">{t("button")}</Button>
      </form>
    </section>
  );
}
