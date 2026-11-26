import { FlagIcon, MessageSquareIcon, RefreshCwIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton } from "@/components/admin/ui/button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminEmpty } from "@/components/admin/ui/empty";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/table";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import {
  reindexKnowledgeBaseAction,
  toggleMessageFlag,
} from "@/lib/admin/content-actions";
import { cn } from "@/lib/utils";
import { createServiceClient } from "@/lib/supabase/service";

export default async function AdminAiPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/ai">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.ai" });
  const tc = await getTranslations({ locale, namespace: "Admin.common" });
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
  const tDesc = await getTranslations({
    locale,
    namespace: "Admin.descriptions",
  });
  const sp = await searchParams;
  const open = typeof sp.c === "string" ? sp.c : null;
  const svc = createServiceClient();
  const [convs, usage, messages] = await Promise.all([
    svc
      .from("ai_conversations")
      .select("id, locale, flagged, handed_off_at, created_at, page")
      .order("created_at", { ascending: false })
      .limit(50),
    svc.from("ai_usage_daily").select("*").order("day", { ascending: false }),
    open
      ? svc
          .from("ai_messages")
          .select("id, role, content, flagged, cost_usd")
          .eq("conversation_id", open)
          .order("created_at")
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("ai")}
        description={tDesc("ai")}
        actions={
          <form action={reindexKnowledgeBaseAction}>
            <AdminButton type="submit" variant="outline" size="sm">
              <RefreshCwIcon aria-hidden />
              {t("reindex")}
            </AdminButton>
          </form>
        }
      />

      <AdminCard className="overflow-hidden">
        <AdminCardHeader>
          <AdminCardTitle>{t("dailyCost")}</AdminCardTitle>
        </AdminCardHeader>
        {(usage.data ?? []).length === 0 ? (
          <AdminEmpty title={tc("nothingYet")} />
        ) : (
          <AdminTable>
            <AdminTableHeader>
              <AdminTableRow>
                <AdminTableHead>{t("day")}</AdminTableHead>
                <AdminTableHead className="text-right">
                  {t("answers")}
                </AdminTableHead>
                <AdminTableHead className="text-right">
                  {t("tokens")}
                </AdminTableHead>
                <AdminTableHead className="text-right">
                  {t("cost")}
                </AdminTableHead>
              </AdminTableRow>
            </AdminTableHeader>
            <AdminTableBody>
              {(usage.data ?? []).map((u) => (
                <AdminTableRow key={String(u.day)}>
                  <AdminTableCell className="tabular-nums">
                    {String(u.day).slice(0, 10)}
                  </AdminTableCell>
                  <AdminTableCell className="text-right tabular-nums">
                    {u.answers}
                  </AdminTableCell>
                  <AdminTableCell className="text-right tabular-nums">
                    {u.tokens_in}/{u.tokens_out}
                  </AdminTableCell>
                  <AdminTableCell className="text-right tabular-nums">
                    {Number(u.cost_usd ?? 0).toFixed(4)}
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </AdminCard>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <AdminCard className="overflow-hidden">
          <AdminCardHeader>
            <AdminCardTitle>{t("conversations")}</AdminCardTitle>
          </AdminCardHeader>
          {(convs.data ?? []).length === 0 ? (
            <AdminEmpty icon={MessageSquareIcon} title={tc("nothingYet")} />
          ) : (
            <ul className="divide-y">
              {(convs.data ?? []).map((c) => (
                <li key={c.id}>
                  <a
                    href={`?c=${c.id}`}
                    className={cn(
                      "flex flex-col gap-1 px-4 py-2.5 text-sm hover:bg-muted/50",
                      open === c.id && "bg-accent",
                    )}
                    aria-current={open === c.id ? "true" : undefined}
                  >
                    <span className="tabular-nums">
                      {c.created_at.slice(0, 16).replace("T", " ")}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="uppercase">{c.locale}</span>
                      {c.page ? (
                        <span className="truncate">{c.page}</span>
                      ) : null}
                      {c.flagged ? (
                        <AdminBadge tone="warning">{t("flagged")}</AdminBadge>
                      ) : null}
                      {c.handed_off_at ? (
                        <AdminBadge tone="info">{t("handedOff")}</AdminBadge>
                      ) : null}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard className="xl:col-span-2">
          <AdminCardHeader>
            <AdminCardTitle>{t("transcript")}</AdminCardTitle>
          </AdminCardHeader>
          {open ? (
            <AdminCardContent className="flex flex-col gap-3">
              {(messages.data ?? []).map((m) => (
                <div key={m.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AdminBadge tone={m.role === "user" ? "neutral" : "info"}>
                      {m.role}
                    </AdminBadge>
                    {m.flagged ? (
                      <AdminBadge tone="warning">{t("flagged")}</AdminBadge>
                    ) : null}
                    <form action={toggleMessageFlag} className="ml-auto">
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="hidden"
                        name="flagged"
                        value={m.flagged ? "false" : "true"}
                      />
                      <AdminButton type="submit" variant="ghost" size="xs">
                        <FlagIcon aria-hidden />
                        {m.flagged ? t("unflag") : t("flag")}
                      </AdminButton>
                    </form>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
            </AdminCardContent>
          ) : (
            <AdminEmpty
              icon={MessageSquareIcon}
              title={t("pickConversation")}
            />
          )}
        </AdminCard>
      </div>
    </div>
  );
}
