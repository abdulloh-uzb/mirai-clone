import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/course/quiz-runner";
import { Button } from "@/components/ui/button";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCourseOutline, getEnrollment } from "@/lib/portal/enrollment";
import { startQuiz } from "@/lib/portal/quiz-actions";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/course/[enrollmentId]/[section]/quiz">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Quiz" });
  return { title: t("title") };
}

export default async function SectionQuizPage({
  params,
}: PageProps<"/[locale]/portal/course/[enrollmentId]/[section]/quiz">) {
  const { locale, enrollmentId, section: sectionParam } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const sectionPosition = Number(sectionParam);
  if (!Number.isInteger(sectionPosition) || sectionPosition < 1) notFound();

  const enrollment = await getEnrollment(enrollmentId);
  if (!enrollment) notFound();
  if (
    enrollment.status !== "active" ||
    (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date())
  ) {
    redirect({ href: "/portal", locale });
  }

  const outline = await getCourseOutline(enrollment);
  const section = outline.find((s) => s.position === sectionPosition);
  if (!section) notFound();
  const back = `/portal/course/${enrollmentId}/${sectionPosition}`;
  if (
    section.status === "locked" ||
    !section.lessons.every((l) => l.status === "completed")
  ) {
    redirect({ href: back, locale });
  }

  const t = await getTranslations({ locale, namespace: "Quiz" });
  const started = await startQuiz({
    enrollmentId,
    section: sectionPosition,
  });
  if (!started.ok) {
    // An identity check is answered on the lesson page.
    if (started.error === "identityCheckRequired") {
      redirect({ href: back, locale });
    }
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p role="alert" className="text-destructive">
          {t(`errors.${started.error}`)}
        </p>
        <Button asChild className="mt-4">
          <Link href={back}>{t("backToSection")}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-sm text-muted-foreground">
        {t("sectionOf", { section: sectionPosition })}
      </p>
      <h1 className="mt-1 mb-2 text-3xl font-bold tracking-tight">
        {t("heading")}
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">{t("intro")}</p>
      <QuizRunner
        enrollmentId={enrollmentId}
        section={sectionPosition}
        isLastSection={sectionPosition === outline.length}
        initial={started.quiz}
      />
    </main>
  );
}
