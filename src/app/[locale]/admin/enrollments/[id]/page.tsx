import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { EnrollmentActions } from "@/components/admin/enrollment-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminDetailList } from "@/components/admin/ui/detail-list";
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
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.enrollments" }),
    getTranslations({ locale, namespace: "Admin.common" }),
  ]);
  const { data: e } = await createServiceClient()
    .from("enrollments")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!e) notFound();
  const emails = await emailsFor([e.user_id]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t("detail")}
        meta={
          <>
            <span className="font-mono text-xs">{e.id.slice(0, 8)}</span>
            <StatusBadge status={e.status} />
          </>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t("actions")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <EnrollmentActions locale={locale} enrollment={e} />
            </AdminCardContent>
          </AdminCard>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{tc("summary")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminDetailList
              items={[
                {
                  label: t("user"),
                  value: (
                    <Link
                      href={`/admin/students/${e.user_id}`}
                      className="font-medium hover:underline"
                    >
                      {emails[e.user_id] || e.user_id}
                    </Link>
                  ),
                },
                {
                  label: t("status"),
                  value: <StatusBadge status={e.status} />,
                },
                {
                  label: t("language"),
                  value: <span className="uppercase">{e.course_locale}</span>,
                },
                {
                  label: t("started"),
                  value: e.started_at?.slice(0, 10) ?? t("notStarted"),
                },
                {
                  label: t("expires"),
                  value: e.expires_at?.slice(0, 10) ?? "—",
                },
              ]}
            />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
