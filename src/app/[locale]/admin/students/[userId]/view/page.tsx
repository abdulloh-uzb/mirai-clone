import type { Metadata } from "next";
import { EyeIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminAlert } from "@/components/admin/ui/alert";
import { Dashboard } from "@/components/portal/dashboard";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { getCourseOutline } from "@/lib/portal/enrollment";
import { createServiceClient } from "@/lib/supabase/service";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Read-only view of what the Student's dashboard shows. Data comes from the
 * service client (after requireAdmin) and no actions are rendered.
 */
export default async function AdminViewAsStudentPage({
  params,
}: PageProps<"/[locale]/admin/students/[userId]/view">) {
  const { locale, userId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (!z.uuid().safeParse(userId).success) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin" });
  const svc = createServiceClient();
  const { data: e } = await svc
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "refunded")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!e) notFound();
  const enrollment = {
    id: e.id,
    courseId: e.course_id,
    courseLocale: e.course_locale,
    status: e.status,
    startedAt: e.started_at,
    expiresAt: e.expires_at,
    courtDueDate: e.court_due_date,
  };
  const outline = await getCourseOutline(enrollment, svc);

  return (
    <div className="flex flex-col gap-6">
      <AdminAlert tone="warning" icon={EyeIcon} role="status">
        {t("readOnly")}
      </AdminAlert>
      <Dashboard
        locale={locale}
        enrollment={enrollment}
        outline={outline}
        hasDetails
        now={new Date()}
        readOnly
      />
    </div>
  );
}
