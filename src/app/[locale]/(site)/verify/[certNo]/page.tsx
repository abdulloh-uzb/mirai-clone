import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/verify/[certNo]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Verify" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

const resultSchema = z.object({
  valid: z.boolean(),
  completedAt: z.string().nullable(),
});

export default async function VerifyPage({
  params,
}: PageProps<"/[locale]/verify/[certNo]">) {
  const { locale, certNo } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Verify" });
  const number = decodeURIComponent(certNo).slice(0, 40);
  const supabase = await createClient();
  const { data } = await supabase.rpc("verify_certificate", {
    p_cert_no: number,
  });
  const parsed = resultSchema.safeParse(data);
  const result = parsed.success ? parsed.data : null;
  const date =
    result?.valid && result.completedAt
      ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
          new Date(`${result.completedAt}T12:00:00Z`),
        )
      : null;

  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p
        role="status"
        data-testid="verify-result"
        className={
          date
            ? "mt-6 rounded-lg border border-green-600/50 bg-green-600/10 px-4 py-3"
            : "mt-6 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3"
        }
      >
        {date ? t("valid", { date }) : t("invalid")}
      </p>
      <form
        action={getPathname({ href: "/verify", locale })}
        className="mt-8 space-y-3"
      >
        <label htmlFor="cert" className="block text-sm font-medium">
          {t("label")}
        </label>
        <input
          id="cert"
          name="cert"
          defaultValue={number}
          className="w-full rounded-md border bg-background px-3 py-2 font-mono"
        />
        <Button type="submit">{t("button")}</Button>
      </form>
    </section>
  );
}
