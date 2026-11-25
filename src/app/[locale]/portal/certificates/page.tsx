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
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      {issued.length ? (
        <ul className="mt-6 space-y-4">
          {issued.map((c) => (
            <li
              key={c.cert_no}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5"
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
        <div className="mt-6 rounded-xl border bg-card p-6">
          <p>{rows.length ? t("inProgress") : t("empty")}</p>
          <Link
            href="/portal"
            className={buttonVariants({ className: "mt-4" })}
          >
            {rows.length ? t("continue") : t("buy")}
          </Link>
        </div>
      )}
    </section>
  );
}
