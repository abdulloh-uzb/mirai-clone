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
import { Button } from "@/components/ui/button";
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
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[18rem_1fr]">
      <aside
        aria-label={t("outline")}
        className="md:sticky md:top-4 md:self-start"
      >
        <ol className="space-y-3">
          {outline.map((s) => (
            <li key={s.id}>
              {s.status === "locked" ? (
                <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <LockIcon className="size-4" aria-hidden />
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
                    className="flex items-center gap-2 text-sm font-semibold hover:underline"
                  >
                    {s.status === "completed" ? (
                      <CheckCircle2Icon
                        className="size-4 text-brand-green"
                        aria-hidden
                      />
                    ) : (
                      <CircleIcon className="size-4" aria-hidden />
                    )}
                    {s.position}. {s.title}
                  </Link>
                  {s.id === section.id ? (
                    <ol className="mt-1 ml-6 space-y-1">
                      {s.lessons.map((l) => (
                        <li key={l.id} className="text-sm">
                          {l.status === "locked" ? (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <LockIcon className="size-3.5" aria-hidden />
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
                                "hover:underline",
                                l.id === lesson.id && "font-semibold",
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
          <p
            role="status"
            className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm"
          >
            {t(`accessBanner.d${banner}`)}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {t("sectionOf", { section: section.position })}
        </p>
        <h1 className="mt-1 mb-6 text-3xl font-bold tracking-tight">
          {lesson.title}
        </h1>
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

        {lesson.status === "completed" ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {nextInSection ? (
              <Button asChild>
                <Link href={lessonHref(nextInSection.position)}>
                  {t("next")}
                </Link>
              </Button>
            ) : null}
          </div>
        ) : null}

        {sectionDone && !nextInSection ? (
          <div className="mt-8 rounded-xl border bg-card p-4">
            <p className="font-semibold">{t("sectionDone")}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button asChild>
                <Link href={`${here}/quiz`}>{t("takeQuiz")}</Link>
              </Button>
              {section.status === "completed" ? (
                <p className="self-center text-sm text-brand-green">
                  {t("quizPassed")}
                </p>
              ) : null}
              {nextSection && nextSection.status !== "locked" ? (
                <Button asChild variant="outline">
                  <Link
                    href={`/portal/course/${enrollmentId}/${nextSection.position}`}
                  >
                    {t("nextSection")}
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
