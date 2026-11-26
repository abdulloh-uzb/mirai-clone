import type { Metadata } from "next";
import { EyeIcon, LockIcon, LockOpenIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { EnrollmentActions } from "@/components/admin/enrollment-actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton } from "@/components/admin/ui/button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminDetailList } from "@/components/admin/ui/detail-list";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { AdminField } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";
import {
  AdminTable,
  AdminTableBody,
  AdminTableCell,
  AdminTableHead,
  AdminTableHeader,
  AdminTableRow,
} from "@/components/admin/ui/table";
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

function ResultBadge({
  passed,
  submitted,
  labels,
}: {
  passed: boolean | null;
  submitted: boolean;
  labels: { passed: string; failed: string };
}) {
  return passed ? (
    <AdminBadge tone="success">{labels.passed}</AdminBadge>
  ) : submitted ? (
    <AdminBadge tone="danger">{labels.failed}</AdminBadge>
  ) : (
    "—"
  );
}

export default async function AdminStudentPage({
  params,
}: PageProps<"/[locale]/admin/students/[userId]">) {
  const { locale, userId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  if (!z.uuid().safeParse(userId).success) notFound();
  const [t, tc, te, tOrders] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.students" }),
    getTranslations({ locale, namespace: "Admin.common" }),
    getTranslations({ locale, namespace: "Admin.enrollments" }),
    getTranslations({ locale, namespace: "Admin.orders" }),
  ]);
  const s = await loadStudent(userId);
  if (!s) notFound();
  const { profile } = s;
  const resultLabels = { passed: t("passed"), failed: t("failed") };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={`${profile.first_name} ${profile.last_name}`}
        description={s.email}
        meta={
          profile.details_locked_at ? (
            <AdminBadge tone="warning">
              <LockIcon aria-hidden />
              {t("detailsLocked")}
            </AdminBadge>
          ) : (
            <AdminBadge>
              <LockOpenIcon aria-hidden />
              {t("detailsOpen")}
            </AdminBadge>
          )
        }
        actions={
          <AdminButton asChild variant="outline" size="sm">
            <Link href={`/admin/students/${userId}/view`}>
              <EyeIcon aria-hidden />
              {t("viewAs")}
            </Link>
          </AdminButton>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t("enrollments")}</AdminCardTitle>
            </AdminCardHeader>
            {s.enrollments.length ? (
              <div className="divide-y">
                {s.enrollments.map((e) => (
                  <div key={e.id} className="flex flex-col gap-4 p-4">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Link
                        href={`/admin/enrollments/${e.id}`}
                        className="font-mono text-xs font-medium hover:underline"
                      >
                        {e.id.slice(0, 8)}
                      </Link>
                      <StatusBadge status={e.status} />
                      <span className="text-muted-foreground">
                        {t("progress")}:{" "}
                        <span className="font-medium text-foreground tabular-nums">
                          {s.progress[e.id] ?? 0}%
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        {te("expires")}: {e.expires_at?.slice(0, 10) ?? "—"}
                      </span>
                    </div>
                    <EnrollmentActions locale={locale} enrollment={e} />
                  </div>
                ))}
              </div>
            ) : (
              <AdminEmpty title={t("noneYet")} />
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("quizAttempts")}</AdminCardTitle>
            </AdminCardHeader>
            {s.quizzes.length ? (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>{tc("date")}</AdminTableHead>
                    <AdminTableHead className="text-right">
                      {t("score")}
                    </AdminTableHead>
                    <AdminTableHead>{t("result")}</AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {s.quizzes.map((q) => (
                    <AdminTableRow key={q.id}>
                      <AdminTableCell className="tabular-nums">
                        {q.submitted_at?.slice(0, 16).replace("T", " ") ?? "—"}
                      </AdminTableCell>
                      <AdminTableCell className="text-right tabular-nums">
                        {q.score ?? "—"}
                      </AdminTableCell>
                      <AdminTableCell>
                        <ResultBadge
                          passed={q.passed}
                          submitted={Boolean(q.submitted_at)}
                          labels={resultLabels}
                        />
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            ) : (
              <AdminEmpty title={t("noneYet")} />
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("examAttempts")}</AdminCardTitle>
            </AdminCardHeader>
            {s.exams.length ? (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>{tc("date")}</AdminTableHead>
                    <AdminTableHead className="text-right">
                      {t("score")}
                    </AdminTableHead>
                    <AdminTableHead>{t("result")}</AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {s.exams.map((x) => (
                    <AdminTableRow key={x.id}>
                      <AdminTableCell className="tabular-nums">
                        {x.started_at.slice(0, 16).replace("T", " ")}
                      </AdminTableCell>
                      <AdminTableCell className="text-right tabular-nums">
                        {x.score ?? "—"}
                      </AdminTableCell>
                      <AdminTableCell>
                        <ResultBadge
                          passed={x.passed}
                          submitted={Boolean(x.submitted_at)}
                          labels={resultLabels}
                        />
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            ) : (
              <AdminEmpty title={t("noneYet")} />
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("identityChecks")}</AdminCardTitle>
            </AdminCardHeader>
            {s.checks.length ? (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>{tc("date")}</AdminTableHead>
                    <AdminTableHead>{t("question")}</AdminTableHead>
                    <AdminTableHead>{t("result")}</AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {s.checks.map((c) => (
                    <AdminTableRow key={c.id}>
                      <AdminTableCell className="tabular-nums">
                        {c.asked_at.slice(0, 16).replace("T", " ")}
                      </AdminTableCell>
                      <AdminTableCell className="font-mono text-xs">
                        {c.question_key}
                      </AdminTableCell>
                      <AdminTableCell>
                        {c.correct ? (
                          <AdminBadge tone="success">{t("correct")}</AdminBadge>
                        ) : (
                          <AdminBadge tone="danger">
                            {t("incorrect")}
                          </AdminBadge>
                        )}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            ) : (
              <AdminEmpty title={t("noneYet")} />
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("orders")}</AdminCardTitle>
            </AdminCardHeader>
            {s.orders.length ? (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>{t("orders")}</AdminTableHead>
                    <AdminTableHead className="text-right">
                      {tOrders("amount")}
                    </AdminTableHead>
                    <AdminTableHead>{tc("status")}</AdminTableHead>
                    <AdminTableHead>{t("refunds")}</AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {s.orders.map((o) => {
                    const refunds = s.refunds.filter(
                      (r) => r.order_id === o.id,
                    );
                    return (
                      <AdminTableRow key={o.id}>
                        <AdminTableCell>
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="font-mono text-xs font-medium hover:underline"
                          >
                            {o.id.slice(0, 8).toUpperCase()}
                          </Link>
                        </AdminTableCell>
                        <AdminTableCell className="text-right tabular-nums">
                          {formatUsd(o.amount_cents, locale)}
                        </AdminTableCell>
                        <AdminTableCell>
                          <StatusBadge status={o.status} />
                        </AdminTableCell>
                        <AdminTableCell>
                          {refunds.length
                            ? refunds.map((r) => (
                                <span
                                  key={r.id}
                                  className="mr-3 inline-flex items-center gap-1.5"
                                >
                                  {formatUsd(r.amount_cents, locale)}{" "}
                                  <StatusBadge status={r.status} />
                                </span>
                              ))
                            : "—"}
                        </AdminTableCell>
                      </AdminTableRow>
                    );
                  })}
                </AdminTableBody>
              </AdminTable>
            ) : (
              <AdminEmpty title={t("noneYet")} />
            )}
          </AdminCard>

          <AdminCard className="overflow-hidden">
            <AdminCardHeader>
              <AdminCardTitle>{t("audit")}</AdminCardTitle>
            </AdminCardHeader>
            {s.audit.length ? (
              <AdminTable>
                <AdminTableHeader>
                  <AdminTableRow>
                    <AdminTableHead>{tc("date")}</AdminTableHead>
                    <AdminTableHead>{t("action")}</AdminTableHead>
                    <AdminTableHead className="min-w-48 whitespace-normal">
                      {tc("reason")}
                    </AdminTableHead>
                  </AdminTableRow>
                </AdminTableHeader>
                <AdminTableBody>
                  {s.audit.map((a) => (
                    <AdminTableRow key={a.id}>
                      <AdminTableCell className="tabular-nums">
                        {a.created_at.slice(0, 16).replace("T", " ")}
                      </AdminTableCell>
                      <AdminTableCell className="font-mono text-xs">
                        {a.action}
                      </AdminTableCell>
                      <AdminTableCell className="min-w-48 whitespace-normal">
                        {typeof a.after === "object" &&
                        a.after !== null &&
                        "reason" in a.after
                          ? String(a.after.reason)
                          : "—"}
                      </AdminTableCell>
                    </AdminTableRow>
                  ))}
                </AdminTableBody>
              </AdminTable>
            ) : (
              <AdminEmpty title={t("noneYet")} />
            )}
          </AdminCard>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{tc("summary")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminDetailList
              items={[
                { label: t("email"), value: s.email },
                { label: t("legalName"), value: profile.legal_name ?? "—" },
                { label: t("dob"), value: profile.dob ?? "—" },
                {
                  label: t("licenseNo"),
                  value: (
                    <span className="font-mono text-xs">
                      {profile.license_no ?? "—"}
                    </span>
                  ),
                },
                { label: t("phone"), value: profile.phone ?? "—" },
              ]}
            />
          </AdminCard>

          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t("editLocked")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <ConfirmForm
                action={updateLockedDetails}
                hidden={{ userId }}
                submitLabel={tc("save")}
                reasonLabel={tc("reason")}
                tone="primary"
                layout="stacked"
              >
                <AdminField label={t("legalName")}>
                  <AdminInput
                    name="legalName"
                    required
                    defaultValue={profile.legal_name ?? ""}
                  />
                </AdminField>
                <AdminField label={t("dob")}>
                  <AdminInput
                    type="date"
                    name="dob"
                    required
                    defaultValue={profile.dob ?? ""}
                  />
                </AdminField>
                <AdminField label={t("licenseNo")}>
                  <AdminInput
                    name="licenseNo"
                    required
                    defaultValue={profile.license_no ?? ""}
                  />
                </AdminField>
              </ConfirmForm>
            </AdminCardContent>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader>
              <AdminCardTitle>{t("editContact")}</AdminCardTitle>
            </AdminCardHeader>
            <AdminCardContent>
              <ConfirmForm
                action={updateContact}
                hidden={{ userId }}
                submitLabel={tc("save")}
                reasonLabel={tc("reason")}
                layout="stacked"
              >
                <AdminField label={t("phone")}>
                  <AdminInput name="phone" defaultValue={profile.phone ?? ""} />
                </AdminField>
              </ConfirmForm>
            </AdminCardContent>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
