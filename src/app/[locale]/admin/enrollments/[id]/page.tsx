import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { EnrollmentActions } from "@/components/admin/enrollment-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { emailsFor } from "@/lib/admin/emails";
import { createServiceClient } from "@/lib/supabase/service";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/enrollments/[id]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.enrollments" });
  return { title: t("detail") };
}

export default async function AdminEnrollmentPage({
  params,
}: PageProps<"/[locale]/admin/enrollments/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (!z.uuid().safeParse(id).success) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.enrollments" });
  const { data: e } = await createServiceClient()
    .from("enrollments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!e) notFound();
  const emails = await emailsFor([e.user_id]);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("detail")}</h1>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">{t("user")}</dt>
          <dd>
            <Link href={`/admin/students/${e.user_id}`} className="underline">
              {emails[e.user_id] || e.user_id}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("status")}</dt>
          <dd>
            <StatusBadge status={e.status} />
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("language")}</dt>
          <dd>{e.course_locale}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("started")}</dt>
          <dd>{e.started_at?.slice(0, 10) ?? t("notStarted")}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("expires")}</dt>
          <dd>{e.expires_at?.slice(0, 10) ?? "—"}</dd>
        </div>
      </dl>
      <EnrollmentActions locale={locale} enrollment={e} />
    </section>
  );
}
