import type { Metadata } from "next";
import { CheckCircle2Icon, CircleIcon, LockIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  IdentityCheckDialog,
  type IdentityCheck,
} from "@/components/course/identity-check-dialog";
import { LessonPlayer } from "@/components/course/lesson-player";
import { LmsHero, LmsWrap } from "@/components/layout/lms-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { daysLeft, accessBanner } from "@/lib/course/access";
import {
  getCourseOutline,
  getEnrollment,
  getLessonBlocks,
} from "@/lib/portal/enrollment";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portal/course/[enrollmentId]/[section]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Player" });
  return { title: t("title") };
}

export default async function CourseSectionPage({
  params,
  searchParams,
}: PageProps<"/[locale]/portal/course/[enrollmentId]/[section]">) {
  const { locale, enrollmentId, section: sectionParam } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const sectionPosition = Number(sectionParam);
  if (!Number.isInteger(sectionPosition) || sectionPosition < 1) notFound();

  const enrollment = await getEnrollment(enrollmentId);
  if (!enrollment) notFound();

  const supabase = await createClient();
  const { data: hasDetails } = await supabase.rpc("has_driver_details", {
    p_enrollment_id: enrollmentId,
  });
  const here = `/portal/course/${enrollmentId}/${sectionPosition}`;
  if (!hasDetails) {
    redirect({
      href: `/portal/details/${enrollmentId}?next=${encodeURIComponent(here)}`,
      locale,
    });
  }
  const now = new Date();
  if (
    enrollment.status !== "active" ||
    (enrollment.expiresAt && new Date(enrollment.expiresAt) < now)
  ) {
    redirect({ href: "/portal", locale });
  }

  const outline = await getCourseOutline(enrollment);
  const section = outline.find((s) => s.position === sectionPosition);
  if (!section) notFound();
  if (section.status === "locked") redirect({ href: "/portal", locale });

  const query = (await searchParams).lesson;
  const wanted = Number(typeof query === "string" ? query : "");
  const firstOpen =
    section.lessons.find((l) => l.status === "available") ?? section.lessons[0];
  let lesson = section.lessons.find((l) => l.position === wanted) ?? firstOpen;
  if (lesson.status === "locked") lesson = firstOpen;
  if (!lesson) notFound();

  const { data: dueCheck } = await supabase.rpc("identity_check_due", {
    p_enrollment_id: enrollmentId,
  });
  const check = dueCheck as IdentityCheck | null;

  const blocks = await getLessonBlocks(lesson.id, enrollment.courseLocale);
  const t = await getTranslations({ locale, namespace: "Player" });

  const nextInSection = section.lessons.find(
    (l) => l.position === lesson.position + 1,
  );
  const lessonHref = (position: number) => `${here}?lesson=${position}`;
  const sectionDone = section.lessons.every((l) => l.status === "completed");
  const nextSection = outline.find((s) => s.position === sectionPosition + 1);
  const banner = accessBanner(daysLeft(enrollment.expiresAt, now));

  return (
    <>
      <LmsHero
        kicker={t("sectionOf", { section: section.position })}
        title={lesson.title}
        intro={section.title}
      />
      <LmsWrap className="grid gap-8 py-8 sm:py-10 md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside
          aria-label={t("outline")}
          className="md:sticky md:top-[calc(var(--header-h,76px)+16px)] md:max-h-[calc(100vh-var(--header-h,76px)-32px)] md:self-start md:overflow-y-auto"
        >
          <ol className="grid gap-2 rounded-[22px] border border-line-blue bg-surface p-3">
            {outline.map((s) => (
              <li key={s.id}>
                {s.status === "locked" ? (
                  <p className="flex min-h-11 items-center gap-2.5 rounded-[14px] px-3 py-2 text-[15px] font-bold text-muted-foreground">
                    <LockIcon className="size-4 shrink-0" aria-hidden />
                    <span>
                      {s.position}. {s.title}
                    </span>
                    <span className="sr-only">{t("locked")}</span>
                  </p>
                ) : (
                  <>
                    <Link
                      href={`/portal/course/${enrollmentId}/${s.position}`}
                      aria-current={s.id === section.id ? "true" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 rounded-[14px] px-3 py-2 text-[15px] leading-snug font-bold transition-colors hover:bg-hero",
                        s.id === section.id &&
                          "bg-card shadow-[0_2px_8px_-4px_#0a304659] hover:bg-card",
                      )}
                    >
                      {s.status === "completed" ? (
                        <CheckCircle2Icon
                          className="size-[18px] shrink-0 text-green-ink"
                          aria-hidden
                        />
                      ) : (
                        <CircleIcon
                          className="size-[18px] shrink-0 text-blue-text"
                          aria-hidden
                        />
                      )}
                      {s.position}. {s.title}
                    </Link>
                    {s.id === section.id ? (
                      <ol className="mt-1 mb-1 ml-5 grid gap-0.5 border-l-2 border-line-blue pl-3">
                        {s.lessons.map((l) => (
                          <li key={l.id} className="text-[15px]">
                            {l.status === "locked" ? (
                              <span className="flex min-h-9 items-center gap-1.5 px-2 text-muted-foreground">
                                <LockIcon
                                  className="size-3.5 shrink-0"
                                  aria-hidden
                                />
                                {l.title}
                                <span className="sr-only">{t("locked")}</span>
                              </span>
                            ) : (
                              <Link
                                href={lessonHref(l.position)}
                                aria-current={
                                  l.id === lesson.id ? "page" : undefined
                                }
                                className={cn(
                                  "flex min-h-9 items-center gap-1.5 rounded-[10px] px-2 py-1 hover:bg-hero",
                                  l.id === lesson.id &&
                                    "bg-blue-tint font-bold text-foreground",
                                )}
                              >
                                {l.status === "completed" ? "✓ " : ""}
                                {l.title}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ol>
        </aside>

        <main id="lesson" className="min-w-0">
          {check ? (
            <IdentityCheckDialog enrollmentId={enrollmentId} check={check} />
          ) : null}
          {banner ? (
            <Notice role="status" tone="warning" className="mb-6">
              {t(`accessBanner.d${banner}`)}
            </Notice>
          ) : null}
          <LessonPlayer
            key={lesson.id}
            enrollmentId={enrollmentId}
            lessonId={lesson.id}
            minSeconds={lesson.minSeconds}
            initialSeconds={lesson.secondsSpent}
            completed={lesson.status === "completed"}
            blocks={blocks}
            nextHref={nextInSection ? lessonHref(nextInSection.position) : null}
          />

          {lesson.status === "completed" && nextInSection ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={lessonHref(nextInSection.position)}>
                  {t("next")}
                </Link>
              </Button>
            </div>
          ) : null}

          {sectionDone && !nextInSection ? (
            <Card variant="panel" padding="lg" className="mt-8">
              <p className="flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
                <CheckCircle2Icon
                  className="size-6 shrink-0 text-green-ink"
                  aria-hidden
                />
                {t("sectionDone")}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href={`${here}/quiz`}>{t("takeQuiz")}</Link>
                </Button>
                {section.status === "completed" ? (
                  <Badge tone="success">{t("quizPassed")}</Badge>
                ) : null}
                {nextSection && nextSection.status !== "locked" ? (
                  <Button asChild size="lg" variant="outline">
                    <Link
                      href={`/portal/course/${enrollmentId}/${nextSection.position}`}
                    >
                      {t("nextSection")}
                    </Link>
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}
        </main>
      </LmsWrap>
    </>
  );
}
