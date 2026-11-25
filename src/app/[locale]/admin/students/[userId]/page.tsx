import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { EnrollmentActions } from "@/components/admin/enrollment-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { updateContact, updateLockedDetails } from "@/lib/admin/actions";
import { loadStudent } from "@/lib/admin/students";
import { formatUsd } from "@/lib/courses/courses";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/students/[userId]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Admin.students" });
  return { title: t("profile") };
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminStudentPage({
  params,
}: PageProps<"/[locale]/admin/students/[userId]">) {
  const { locale, userId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (!z.uuid().safeParse(userId).success) notFound();
  const [t, tc, te] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.students" }),
    getTranslations({ locale, namespace: "Admin.common" }),
    getTranslations({ locale, namespace: "Admin.enrollments" }),
  ]);
  const s = await loadStudent(userId);
  if (!s) notFound();
  const { profile } = s;
  const input = "rounded-md border bg-background px-2 py-1";

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">
        {profile.first_name} {profile.last_name}
      </h1>
      <p className="mt-1 text-muted-foreground">{s.email}</p>
      <p className="mt-2 flex items-center gap-4 text-sm">
        <span>
          {profile.details_locked_at ? t("detailsLocked") : t("detailsOpen")}
        </span>
        <Link
          href={`/admin/students/${userId}/view`}
          className="font-medium underline"
        >
          {t("viewAs")}
        </Link>
      </p>

      <Block title={t("editLocked")}>
        <ConfirmForm
          action={updateLockedDetails}
          hidden={{ userId }}
          submitLabel={tc("save")}
          reasonLabel={tc("reason")}
        >
          <label className="flex flex-col gap-1 text-sm">
            {t("legalName")}
            <input
              name="legalName"
              required
              defaultValue={profile.legal_name ?? ""}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("dob")}
            <input
              type="date"
              name="dob"
              required
              defaultValue={profile.dob ?? ""}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t("licenseNo")}
            <input
              name="licenseNo"
              required
              defaultValue={profile.license_no ?? ""}
              className={input}
            />
          </label>
        </ConfirmForm>
      </Block>

      <Block title={t("editContact")}>
        <ConfirmForm
          action={updateContact}
          hidden={{ userId }}
          submitLabel={tc("save")}
          reasonLabel={tc("reason")}
        >
          <label className="flex flex-col gap-1 text-sm">
            {t("phone")}
            <input
              name="phone"
              defaultValue={profile.phone ?? ""}
              className={input}
            />
          </label>
        </ConfirmForm>
      </Block>

      <Block title={t("enrollments")}>
        {s.enrollments.length ? (
          s.enrollments.map((e) => (
            <div key={e.id} className="mt-3">
              <p className="flex flex-wrap items-center gap-3 text-sm">
                <Link
                  href={`/admin/enrollments/${e.id}`}
                  className="font-mono underline"
                >
                  {e.id.slice(0, 8)}
                </Link>
                <StatusBadge status={e.status} />
                <span>
                  {t("progress")}: {s.progress[e.id] ?? 0}%
                </span>
                <span>
                  {te("expires")}: {e.expires_at?.slice(0, 10) ?? "—"}
                </span>
              </p>
              <EnrollmentActions locale={locale} enrollment={e} />
            </div>
          ))
        ) : (
          <p className="mt-2 text-muted-foreground">{t("noneYet")}</p>
        )}
      </Block>

      <Block title={t("quizAttempts")}>
        <ul className="mt-2 text-sm">
          {s.quizzes.map((q) => (
            <li key={q.id}>
              {q.submitted_at?.slice(0, 16).replace("T", " ") ?? "—"} ·{" "}
              {t("score")}: {q.score ?? "—"} ·{" "}
              {q.passed ? t("passed") : q.submitted_at ? t("failed") : "—"}
            </li>
          ))}
          {s.quizzes.length ? null : <li>{t("noneYet")}</li>}
        </ul>
      </Block>

      <Block title={t("examAttempts")}>
        <ul className="mt-2 text-sm">
          {s.exams.map((x) => (
            <li key={x.id}>
              {x.started_at.slice(0, 16).replace("T", " ")} · {t("score")}:{" "}
              {x.score ?? "—"} ·{" "}
              {x.passed ? t("passed") : x.submitted_at ? t("failed") : "—"}
            </li>
          ))}
          {s.exams.length ? null : <li>{t("noneYet")}</li>}
        </ul>
      </Block>

      <Block title={t("identityChecks")}>
        <ul className="mt-2 text-sm">
          {s.checks.map((c) => (
            <li key={c.id}>
              {c.asked_at.slice(0, 16).replace("T", " ")} · {c.question_key} ·{" "}
              {c.correct ? t("correct") : t("incorrect")}
            </li>
          ))}
          {s.checks.length ? null : <li>{t("noneYet")}</li>}
        </ul>
      </Block>

      <Block title={t("orders")}>
        <ul className="mt-2 text-sm">
          {s.orders.map((o) => (
            <li key={o.id} className="flex gap-3">
              <Link href={`/admin/orders/${o.id}`} className="underline">
                {o.id.slice(0, 8).toUpperCase()}
              </Link>
              <span>{formatUsd(o.amount_cents, locale)}</span>
              <StatusBadge status={o.status} />
              {s.refunds
                .filter((r) => r.order_id === o.id)
                .map((r) => (
                  <span key={r.id}>
                    {formatUsd(r.amount_cents, locale)} · {r.status}
                  </span>
                ))}
            </li>
          ))}
          {s.orders.length ? null : <li>{t("noneYet")}</li>}
        </ul>
      </Block>

      <Block title={t("audit")}>
        <ul className="mt-2 text-sm">
          {s.audit.map((a) => (
            <li key={a.id}>
              {a.created_at.slice(0, 16).replace("T", " ")} · {a.action}
              {typeof a.after === "object" &&
              a.after !== null &&
              "reason" in a.after
                ? ` · ${String(a.after.reason)}`
                : ""}
            </li>
          ))}
          {s.audit.length ? null : <li>{t("noneYet")}</li>}
        </ul>
      </Block>
    </section>
  );
}
