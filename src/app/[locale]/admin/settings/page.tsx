import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
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
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>

      <h2 className="mt-8 text-xl font-semibold">{t("admins")}</h2>
      <ul className="mt-4 text-sm">
        {(admins.data ?? []).map((a) => (
          <li key={a.user_id} className="flex items-center gap-3 py-1">
            {a.first_name} {a.last_name} · {emails.get(a.user_id)}
            {a.user_id === me.userId ? (
              <span className="text-muted-foreground">{tc("you")}</span>
            ) : (
              <form action={demoteAdmin}>
                <input type="hidden" name="userId" value={a.user_id} />
                <button type="submit" className="text-destructive">
                  {t("demote")}
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <form action={promoteAdmin} className="mt-3 flex gap-2">
        <input
          name="email"
          type="email"
          aria-label={t("accountEmail")}
          required
          placeholder={t("accountEmail")}
          className="rounded-md border bg-background px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground"
        >
          {t("makeAdmin")}
        </button>
      </form>

      <h2 className="mt-8 text-xl font-semibold">{t("stateConfig")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t("stateHint")}</p>
      <CrudList
        table="states"
        rows={states.data ?? []}
        allowCreate={false}
        allowDelete={false}
        describe={(r) => `${r.code} · ${r.name}`}
      />

      <h2 className="mt-8 text-xl font-semibold">{t("notify")}</h2>
      <ul className="mt-4 list-disc pl-6 text-sm">
        {[...perState.entries()].map(([code, n]) => (
          <li key={code}>
            {code}: {n}
          </li>
        ))}
        <li>
          {t("classroomWaitlist", { count: (classroom.data ?? []).length })}
        </li>
      </ul>
      <p className="mt-2 text-sm">
        <a href="/api/admin/waitlists.csv" className="underline">
          {t("downloadCsv")}
        </a>
      </p>

      <h2 className="mt-8 text-xl font-semibold">{t("emailTemplates")}</h2>
      {/* TODO(spec): editing and per-language preview of email templates. */}
      <ul className="mt-4 list-disc pl-6 text-sm">
        {EMAIL_TEMPLATES.map((name) => (
          <li key={name}>
            {t("templateNote", { name: t(`templates.${name}`) })}
          </li>
        ))}
      </ul>
    </section>
  );
}
