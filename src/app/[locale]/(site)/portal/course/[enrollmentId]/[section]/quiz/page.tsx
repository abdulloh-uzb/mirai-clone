import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { QuizRunner } from "@/components/course/quiz-runner";
import { LmsHero, LmsWrap } from "@/components/layout/lms-page";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
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
      <main>
        <LmsHero
          kicker={t("sectionOf", { section: sectionPosition })}
          title={t("heading")}
        />
        <LmsWrap className="max-w-3xl py-8 sm:py-10">
          <Notice role="alert" tone="error">
            {t(`errors.${started.error}`)}
          </Notice>
          <Button asChild size="lg" className="mt-6">
            <Link href={back}>{t("backToSection")}</Link>
          </Button>
        </LmsWrap>
      </main>
    );
  }

  return (
    <main>
      <LmsHero
        kicker={t("sectionOf", { section: sectionPosition })}
        title={t("heading")}
        intro={t("intro")}
      />
      <LmsWrap className="max-w-3xl py-8 sm:py-10">
        <QuizRunner
          enrollmentId={enrollmentId}
          section={sectionPosition}
          isLastSection={sectionPosition === outline.length}
          initial={started.quiz}
        />
      </LmsWrap>
    </main>
  );
}
