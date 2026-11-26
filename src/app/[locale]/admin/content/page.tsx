import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ConfirmSubmit,
  EditToggle,
  SectionTitleForm,
} from "@/components/admin/course-editor";
import { LANGUAGE_NAMES, LangBadge } from "@/components/admin/lang-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import {
  createLesson,
  createSection,
  deleteSection,
} from "@/lib/admin/course-actions";
import { COURSE_LOCALES, type CourseLocale } from "@/lib/course/blocks";
import { createServiceClient } from "@/lib/supabase/service";

type Titles = Partial<Record<CourseLocale, string>>;

const titlesOf = (v: unknown) => (v ?? {}) as Titles;

/** Which languages a lesson is complete in: its title and every block. */
function coverage(title: Titles, blocks: { content: unknown }[]) {
  return Object.fromEntries(
    COURSE_LOCALES.map((l) => [
      l,
      Boolean(title[l]) &&
        blocks.every((b) => Boolean((b.content as Titles | null)?.[l])),
    ]),
  ) as Record<CourseLocale, boolean>;
}

export default async function AdminContentPage({
  params,
}: PageProps<"/[locale]/admin/content">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.editor" });
  const svc = createServiceClient();
  const [courses, sections, lessons, blocks] = await Promise.all([
    svc.from("courses").select("id, slug").order("slug"),
    svc.from("sections").select("*").order("position"),
    svc.from("lessons").select("*").order("position"),
    svc.from("lesson_blocks").select("lesson_id, content"),
  ]);

  const blocksByLesson = new Map<string, { content: unknown }[]>();
  for (const b of blocks.data ?? []) {
    blocksByLesson.set(b.lesson_id, [
      ...(blocksByLesson.get(b.lesson_id) ?? []),
      b,
    ]);
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t("intro")}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/content/questions">{t("questionBank")}</Link>
        </Button>
      </header>

      {(courses.data ?? []).map((course) => {
        const courseSections = (sections.data ?? []).filter(
          (s) => s.course_id === course.id,
        );
        // The classroom course is waitlist-only and has no lessons.
        if (!courseSections.length) return null;
        return (
          <div key={course.id} className="flex flex-col gap-4">
            {(courses.data ?? []).length > 1 ? (
              <h2 className="text-xl font-bold">{course.slug}</h2>
            ) : null}
            {courseSections.map((section) => {
              const title = titlesOf(section.title);
              const sectionLessons = (lessons.data ?? []).filter(
                (l) => l.section_id === section.id,
              );
              return (
                <Card key={section.id} padding="none">
                  <div className="flex flex-wrap items-center gap-3 border-b border-line-blue px-5 py-4">
                    <Badge tone="info">
                      {t("section", { n: section.position })}
                    </Badge>
                    <h2 className="min-w-0 flex-1 text-lg font-bold">
                      {title.en ?? "—"}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                      {t("lessonsCount", { count: sectionLessons.length })}
                    </span>
                    <EditToggle label={t("editTitle")}>
                      <div className="pt-2">
                        <SectionTitleForm id={section.id} titles={title} />
                      </div>
                    </EditToggle>
                  </div>

                  {sectionLessons.length ? (
                    <ol className="divide-y divide-line-blue">
                      {sectionLessons.map((lesson) => {
                        const lessonTitle = titlesOf(lesson.title);
                        const lessonBlocks =
                          blocksByLesson.get(lesson.id) ?? [];
                        const langs = coverage(lessonTitle, lessonBlocks);
                        return (
                          <li
                            key={lesson.id}
                            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3"
                          >
                            <span className="w-10 text-sm font-bold text-muted-foreground">
                              {section.position}.{lesson.position}
                            </span>
                            <Link
                              href={`/admin/content/lessons/${lesson.id}`}
                              className="min-w-0 flex-1 font-bold hover:underline"
                            >
                              {lessonTitle.en ?? "—"}
                            </Link>
                            <span className="text-sm text-muted-foreground">
                              {t("blocksCount", {
                                count: lessonBlocks.length,
                              })}{" "}
                              ·{" "}
                              {t("minutes", {
                                n: Math.round(lesson.min_seconds / 60),
                              })}
                            </span>
                            <span
                              className="flex gap-1"
                              aria-label={t("languages")}
                            >
                              {COURSE_LOCALES.map((l) => (
                                <LangBadge
                                  key={l}
                                  code={l}
                                  ok={langs[l]}
                                  tip={t(
                                    langs[l] ? "langDone" : "lessonMissing",
                                    { language: LANGUAGE_NAMES[l] },
                                  )}
                                />
                              ))}
                            </span>
                            <Button asChild variant="outline" size="xs">
                              <Link
                                href={`/admin/content/lessons/${lesson.id}`}
                              >
                                {t("edit")}
                              </Link>
                            </Button>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="px-5 py-4 text-sm text-muted-foreground">
                      {t("noLessons")}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-blue px-5 py-3">
                    <form action={createLesson}>
                      <input
                        type="hidden"
                        name="sectionId"
                        value={section.id}
                      />
                      <input type="hidden" name="locale" value={locale} />
                      <Button type="submit" size="sm">
                        + {t("addLesson")}
                      </Button>
                    </form>
                    {sectionLessons.length === 0 ? (
                      <form action={deleteSection}>
                        <input type="hidden" name="id" value={section.id} />
                        <ConfirmSubmit
                          label={t("deleteSection")}
                          question={t("deleteSectionConfirm")}
                        />
                      </form>
                    ) : null}
                  </div>
                </Card>
              );
            })}
            <form action={createSection}>
              <input type="hidden" name="courseId" value={course.id} />
              <Button type="submit" variant="outline">
                + {t("addSection")}
              </Button>
            </form>
          </div>
        );
      })}
    </section>
  );
}
