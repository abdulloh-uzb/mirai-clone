import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getReportSummary } from "@/lib/reporting/status";
import { nextReportingSlot, REPORTING_TZ } from "@/lib/reporting/schedule";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/status/[enrollmentId]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "ReportStatus" });
  return { title: t("title") };
}

export default async function ReportStatusPage({
  params,
}: PageProps<"/[locale]/portal/status/[enrollmentId]">) {
  const { locale, enrollmentId } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "ReportStatus" });
  const report = await getReportSummary(enrollmentId);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: REPORTING_TZ,
    }).format(new Date(iso));

  const rejected = report?.status === "rejected";
  const steps: {
    key: "passed" | "queued" | "sent" | "accepted" | "rejected" | "court";
    at: string | null;
  }[] = [
    { key: "passed", at: report?.passedAt ?? null },
    { key: "queued", at: report?.queuedAt ?? null },
    { key: "sent", at: report?.sentAt ?? null },
    rejected
      ? { key: "rejected", at: report?.rejectedAt ?? null }
      : { key: "accepted", at: report?.acceptedAt ?? null },
    { key: "court", at: report?.courtNotifiedAt ?? null },
  ];
  const done = report?.status === "accepted";

  return (
    <section className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
      {!report ? (
        <p className="mt-6 text-muted-foreground">{t("none")}</p>
      ) : (
        <>
          <ol className="mt-8 space-y-6 border-l-2 pl-6">
            {steps.map((step) => (
              <li key={step.key} className="relative">
                <span
                  className={cn(
                    "absolute top-1 -left-[33px] size-4 rounded-full border-2 bg-background",
                    step.at &&
                      (step.key === "rejected"
                        ? "border-destructive bg-destructive"
                        : "border-primary bg-primary"),
                  )}
                />
                <p
                  className={cn(
                    "font-medium",
                    !step.at && "text-muted-foreground",
                    step.key === "rejected" && "text-destructive",
                  )}
                >
                  {t(`step.${step.key}`)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.at ? fmt(step.at) : t("pending")}
                </p>
                {step.key === "rejected" ? (
                  <p className="mt-1 text-sm text-destructive">
                    {t("rejectedText")}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
          {!done ? (
            <p className="mt-8 text-sm text-muted-foreground">
              {t("nextBatch", {
                time: fmt(nextReportingSlot(new Date()).toISOString()),
              })}
            </p>
          ) : null}
        </>
      )}
      <Link
        href="/portal"
        className="mt-8 inline-block font-medium text-link hover:underline"
      >
        {t("back")}
      </Link>
    </section>
  );
}
