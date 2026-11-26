import { DownloadIcon, MailIcon, PlusIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton, adminButtonVariants } from "@/components/admin/ui/button";
import {
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminInput } from "@/components/admin/ui/input";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { demoteAdmin, promoteAdmin } from "@/lib/admin/content-actions";
import { createServiceClient } from "@/lib/supabase/service";

const EMAIL_TEMPLATES = [
  "receipt",
  "welcome",
  "refundRequested",
  "refundProcessed",
  "contactConfirmation",
  "contactNotification",
  "adaConfirmation",
  "adaNotification",
] as const;

export default async function AdminSettingsPage({
  params,
}: PageProps<"/[locale]/admin/settings">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const me = await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.settings" });
  const tc = await getTranslations({ locale, namespace: "Admin.common" });
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
  const tDesc = await getTranslations({
    locale,
    namespace: "Admin.descriptions",
  });
  const svc = createServiceClient();
  const [admins, states, stateList, classroom] = await Promise.all([
    svc
      .from("profiles")
      .select("user_id, first_name, last_name")
      .eq("role", "admin"),
    svc.from("states").select("*").order("code"),
    svc.from("state_waitlist").select("state_code"),
    svc.from("classroom_waitlist").select("id"),
  ]);
  const emails = new Map<string, string>();
  for (const a of admins.data ?? []) {
    const { data } = await svc.auth.admin.getUserById(a.user_id);
    emails.set(a.user_id, data.user?.email ?? "");
  }
  const perState = new Map<string, number>();
  for (const w of stateList.data ?? []) {
    perState.set(w.state_code, (perState.get(w.state_code) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("settings")}
        description={tDesc("settings")}
      />

      <AdminCard className="overflow-hidden">
        <AdminCardHeader>
          <AdminCardTitle>{t("admins")}</AdminCardTitle>
          <AdminBadge>{(admins.data ?? []).length}</AdminBadge>
        </AdminCardHeader>
        <ul className="divide-y">
          {(admins.data ?? []).map((a) => (
            <li
              key={a.user_id}
              className="flex items-center gap-3 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {a.first_name} {a.last_name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {emails.get(a.user_id)}
                </p>
              </div>
              {a.user_id === me.userId ? (
                <span className="text-xs text-muted-foreground">
                  {tc("you")}
                </span>
              ) : (
                <form action={demoteAdmin}>
                  <input type="hidden" name="userId" value={a.user_id} />
                  <AdminButton
                    type="submit"
                    variant="destructive-ghost"
                    size="xs"
                  >
                    {t("demote")}
                  </AdminButton>
                </form>
              )}
            </li>
          ))}
        </ul>
        <div className="border-t px-4 py-3">
          <form
            action={promoteAdmin}
            className="flex flex-wrap items-center gap-2"
          >
            <AdminInput
              name="email"
              type="email"
              aria-label={t("accountEmail")}
              required
              placeholder={t("accountEmail")}
              className="w-full sm:w-72"
            />
            <AdminButton type="submit" size="sm">
              <PlusIcon aria-hidden />
              {t("makeAdmin")}
            </AdminButton>
          </form>
        </div>
      </AdminCard>

      <CrudList
        title={t("stateConfig")}
        description={t("stateHint")}
        table="states"
        rows={states.data ?? []}
        allowCreate={false}
        allowDelete={false}
        describe={(r) => `${r.code} · ${r.name}`}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard className="overflow-hidden">
          <AdminCardHeader>
            <AdminCardTitle>{t("notify")}</AdminCardTitle>
            <a
              href="/api/admin/waitlists.csv"
              className={adminButtonVariants({
                variant: "outline",
                size: "xs",
              })}
            >
              <DownloadIcon aria-hidden />
              {t("downloadCsv")}
            </a>
          </AdminCardHeader>
          <ul className="divide-y text-sm">
            {[...perState.entries()].map(([code, n]) => (
              <li key={code} className="flex justify-between px-4 py-2.5">
                <span className="font-mono text-xs">{code}</span>
                <span className="tabular-nums">{n}</span>
              </li>
            ))}
            <li className="px-4 py-2.5">
              {t("classroomWaitlist", { count: (classroom.data ?? []).length })}
            </li>
          </ul>
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <AdminCardHeader>
            <AdminCardTitle>{t("emailTemplates")}</AdminCardTitle>
          </AdminCardHeader>
          {/* TODO(spec): editing and per-language preview of email templates. */}
          <ul className="divide-y text-sm">
            {EMAIL_TEMPLATES.map((name) => (
              <li key={name} className="flex items-center gap-2 px-4 py-2.5">
                <MailIcon
                  aria-hidden
                  className="size-4 text-muted-foreground"
                />
                {t("templateNote", { name: t(`templates.${name}`) })}
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </div>
  );
}
