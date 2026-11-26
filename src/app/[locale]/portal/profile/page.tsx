import { LmsBody, LmsHero } from "@/components/layout/lms-page";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { languages } from "@/i18n/languages";
import { routing } from "@/i18n/routing";
import { getCurrentAccount, initialsOf } from "@/lib/auth/current-account";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/profile">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Profile" });
  return { title: t("title") };
}

const STATUSES = [
  "active",
  "paused",
  "locked",
  "completed",
  "expired",
  "refunded",
] as const;

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/portal/profile">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const account = await getCurrentAccount();
  if (!account) notFound();
  const t = await getTranslations({ locale, namespace: "Profile" });

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("legal_name, dob, phone")
    .eq("user_id", account.userId)
    .maybeSingle();
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, course_locale, status, started_at, expires_at, created_at")
    .eq("user_id", account.userId)
    .order("created_at", { ascending: false });
  const latest = enrollments?.[0];
  const notProvided = t("notProvided");
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const formatDate = (value: string | null) =>
    value ? dateFormat.format(new Date(value)) : "-";

  const rows: [string, string][] = [
    [
      t("legalName"),
      profile?.legal_name ||
        `${account.firstName} ${account.lastName}`.trim() ||
        notProvided,
    ],
    [
      t("dob"),
      profile?.dob
        ? `${formatDate(profile.dob)} (${t("dobHint")})`
        : notProvided,
    ],
    [t("phone"), profile?.phone || notProvided],
  ];

  return (
    <>
      <LmsHero title={t("title")} />
      <LmsBody className="grid max-w-4xl gap-6">
        <div className="grid gap-4 rounded-[22px] border border-line-blue bg-card p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span
              aria-hidden
              className="grid size-14 place-items-center rounded-full bg-primary text-lg font-semibold text-primary-foreground"
            >
              {initialsOf(account)}
            </span>
            <div>
              <p className="font-semibold">
                {`${account.firstName} ${account.lastName}`.trim() ||
                  account.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {account.email} · {t("emailNote")}
              </p>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted-foreground">{t("notice")}</p>
          {latest ? (
            <Button asChild className="justify-self-start">
              <Link href={`/portal/details/${latest.id}`}>{t("edit")}</Link>
            </Button>
          ) : null}
        </div>

        <div className="grid gap-4 rounded-[22px] border border-line-blue bg-card p-6 sm:p-8">
          <h2 className="text-[22px] font-extrabold tracking-tight">
            {t("history")}
          </h2>
          {enrollments?.length ? (
            <ul className="grid gap-3">
              {enrollments.map((enrollment) => {
                const status = STATUSES.find((s) => s === enrollment.status);
                const language =
                  languages[enrollment.course_locale as keyof typeof languages];
                return (
                  <li
                    key={enrollment.id}
                    className="rounded-[16px] bg-hero px-4 py-3"
                  >
                    <p className="font-medium">
                      {language?.nativeName ?? enrollment.course_locale} ·{" "}
                      {status ? t(`statuses.${status}`) : enrollment.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("started")}: {formatDate(enrollment.started_at)} ·{" "}
                      {t("expires")}: {formatDate(enrollment.expires_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">{t("historyEmpty")}</p>
          )}
        </div>

        <Link href="/portal/privacy" className="text-sm underline">
          {t("privacy")}
        </Link>
      </LmsBody>
    </>
  );
}
