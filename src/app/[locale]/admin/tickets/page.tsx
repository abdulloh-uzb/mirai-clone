import { LifeBuoyIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminFilterLinks } from "@/components/admin/filter-links";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
import {
  AdminDisclosure,
  AdminDisclosureList,
} from "@/components/admin/ui/disclosure";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminSelect } from "@/components/admin/ui/select";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { setTicketStatus } from "@/lib/admin/content-actions";
import { createServiceClient } from "@/lib/supabase/service";

const TYPES = ["contact", "bug", "ada", "ai_handoff"] as const;
const STATUSES = ["open", "in_progress", "closed"] as const;

export default async function AdminTicketsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/tickets">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.tickets" });
  const tc = await getTranslations({ locale, namespace: "Admin.common" });
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
  const tDesc = await getTranslations({
    locale,
    namespace: "Admin.descriptions",
  });
  const sp = await searchParams;
  const type = TYPES.find((t) => t === sp.type);
  const status = STATUSES.find((s) => s === sp.status);
  let q = createServiceClient()
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (type) q = q.eq("type", type);
  if (status) q = q.eq("status", status);
  const { data } = await q;

  type Type = (typeof TYPES)[number];
  type Status = (typeof STATUSES)[number];
  const tickets = data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title={tNav("tickets")} description={tDesc("tickets")} />
      <AdminCard className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b px-4 py-3">
          <AdminFilterLinks
            label={t("filterType")}
            items={[
              {
                key: "all",
                href: "/admin/tickets",
                label: tc("all"),
                active: !type && !status,
              },
              ...TYPES.map((ty) => ({
                key: ty,
                href: `/admin/tickets?type=${ty}`,
                label: t(`types.${ty}`),
                active: type === ty,
              })),
            ]}
          />
          <AdminFilterLinks
            label={t("filterStatus")}
            items={STATUSES.map((s) => ({
              key: s,
              href: `/admin/tickets?status=${s}`,
              label: t(`statuses.${s}`),
              active: status === s,
            }))}
          />
        </div>
        {tickets.length === 0 ? (
          <AdminEmpty icon={LifeBuoyIcon} title={t("none")} />
        ) : (
          <AdminDisclosureList>
            {tickets.map((tk) => (
              <AdminDisclosure
                key={tk.id}
                summary={
                  <>
                    <AdminBadge>{t(`types.${tk.type as Type}`)}</AdminBadge>
                    <span className="min-w-0 truncate font-medium">
                      {tk.email}
                    </span>
                    <StatusBadge
                      status={tk.status}
                      label={t(`statuses.${tk.status as Status}`)}
                    />
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                      {tk.created_at.slice(0, 10)}
                    </span>
                  </>
                }
              >
                <p className="text-sm whitespace-pre-wrap">{tk.body}</p>
                <form
                  action={setTicketStatus}
                  className="mt-4 flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="id" value={tk.id} />
                  <AdminSelect
                    name="status"
                    aria-label={t("statusLabel")}
                    defaultValue={tk.status}
                    wrapperClassName="w-auto"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {t(`statuses.${s}`)}
                      </option>
                    ))}
                  </AdminSelect>
                  <AdminButton type="submit" size="sm">
                    {tc("update")}
                  </AdminButton>
                </form>
              </AdminDisclosure>
            ))}
          </AdminDisclosureList>
        )}
      </AdminCard>
    </div>
  );
}
