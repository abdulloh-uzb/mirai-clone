import { LmsBody, LmsHero } from "@/components/layout/lms-page";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { issueCertificateFor } from "@/lib/certificates/issue";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/certificates">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Certificates" });
  return { title: t("title") };
}

export default async function CertificatesPage({
  params,
}: PageProps<"/[locale]/portal/certificates">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Certificates" });
  const supabase = await createClient();

  // Own RLS reads.
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, completed_at, certificates(cert_no, pdf_path)")
    .neq("status", "refunded")
    .order("created_at", { ascending: false });

  // Retry path: a completed enrollment without a certificate or PDF.
  let retried = false;
  for (const e of enrollments ?? []) {
    const cert = Array.isArray(e.certificates)
      ? e.certificates[0]
      : e.certificates;
    if (e.status === "completed" && !cert?.pdf_path) {
      await issueCertificateFor(e.id)
        .then(() => (retried = true))
        .catch((err) => console.error("certificate retry failed", err));
    }
  }
  const rows = retried
    ? ((
        await supabase
          .from("enrollments")
          .select("id, status, completed_at, certificates(cert_no, pdf_path)")
          .neq("status", "refunded")
          .order("created_at", { ascending: false })
      ).data ?? [])
    : (enrollments ?? []);

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const issued = rows.flatMap((e) => {
    const cert = Array.isArray(e.certificates)
      ? e.certificates[0]
      : e.certificates;
    return cert ? [{ completedAt: e.completed_at, ...cert }] : [];
  });

  return (
    <>
      <LmsHero title={t("title")} art="certificate" />
      <LmsBody className="max-w-4xl">
        {issued.length ? (
          <ul className="grid gap-4">
            {issued.map((c) => (
              <li
                key={c.cert_no}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border-t-[6px] border-b-[6px] border-t-brand-sky border-b-brand-green bg-card p-6 shadow-panel"
              >
                <div>
                  <p className="text-sm text-muted-foreground">{t("certNo")}</p>
                  <p className="font-mono font-semibold">{c.cert_no}</p>
                  {c.completedAt ? (
                    <p className="mt-1 text-sm">
                      {t("completedOn")} {date.format(new Date(c.completedAt))}
                    </p>
                  ) : null}
                </div>
                {c.pdf_path ? (
                  <a
                    href={`/api/certificates/${c.cert_no}`}
                    className={buttonVariants()}
                  >
                    {t("download")}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("preparing")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-[22px] border border-line-blue bg-card p-6 sm:p-8">
            <p>{rows.length ? t("inProgress") : t("empty")}</p>
            <Link
              href="/portal"
              className={buttonVariants({ className: "mt-4" })}
            >
              {rows.length ? t("continue") : t("buy")}
            </Link>
          </div>
        )}
      </LmsBody>
    </>
  );
}
