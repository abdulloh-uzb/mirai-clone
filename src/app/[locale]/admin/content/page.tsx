import { ListChecksIcon, PlusIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ConfirmSubmit,
  EditToggle,
  SectionTitleForm,
} from "@/components/admin/course-editor";
import { LANGUAGE_NAMES, LangBadge } from "@/components/admin/lang-badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton } from "@/components/admin/ui/button";
import { AdminCard } from "@/components/admin/ui/card";
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
  const tNav = await getTranslations({ locale, namespace: "Admin.nav" });
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
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={tNav("content")}
        description={t("intro")}
        actions={
          <AdminButton asChild variant="outline" size="sm">
            <Link href="/admin/content/questions">
              <ListChecksIcon aria-hidden />
              {t("questionBank")}
            </Link>
          </AdminButton>
        }
      />

      {(courses.data ?? []).map((course) => {
        const courseSections = (sections.data ?? []).filter(
          (s) => s.course_id === course.id,
        );
        // The classroom course is waitlist-only and has no lessons.
        if (!courseSections.length) return null;
        return (
          <div key={course.id} className="flex flex-col gap-4">
            {(courses.data ?? []).length > 1 ? (
              <h2 className="text-base font-semibold">{course.slug}</h2>
            ) : null}
            {courseSections.map((section) => {
              const title = titlesOf(section.title);
              const sectionLessons = (lessons.data ?? []).filter(
                (l) => l.section_id === section.id,
              );
              return (
                <AdminCard key={section.id}>
                  <div className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
                    <AdminBadge tone="info">
                      {t("section", { n: section.position })}
                    </AdminBadge>
                    <h2 className="min-w-0 flex-1 text-sm font-semibold">
                      {title.en ?? "—"}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {t("lessonsCount", { count: sectionLessons.length })}
                    </span>
                    <EditToggle label={t("editTitle")}>
                      <div className="pt-2">
                        <SectionTitleForm id={section.id} titles={title} />
                      </div>
                    </EditToggle>
                  </div>

                  {sectionLessons.length ? (
                    <ol className="divide-y">
                      {sectionLessons.map((lesson) => {
                        const lessonTitle = titlesOf(lesson.title);
                        const lessonBlocks =
                          blocksByLesson.get(lesson.id) ?? [];
                        const langs = coverage(lessonTitle, lessonBlocks);
                        return (
                          <li
                            key={lesson.id}
                            className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5"
                          >
                            <span className="w-10 text-xs font-medium text-muted-foreground tabular-nums">
                              {section.position}.{lesson.position}
                            </span>
                            <Link
                              href={`/admin/content/lessons/${lesson.id}`}
                              className="min-w-0 flex-1 text-sm font-medium hover:underline"
                            >
                              {lessonTitle.en ?? "—"}
                            </Link>
                            <span className="text-xs text-muted-foreground">
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
                            <AdminButton asChild variant="outline" size="xs">
                              <Link
                                href={`/admin/content/lessons/${lesson.id}`}
                              >
                                {t("edit")}
                              </Link>
                            </AdminButton>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="px-4 py-4 text-sm text-muted-foreground">
                      {t("noLessons")}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-b-lg border-t bg-muted/30 px-4 py-3">
                    <form action={createLesson}>
                      <input
                        type="hidden"
                        name="sectionId"
                        value={section.id}
                      />
                      <input type="hidden" name="locale" value={locale} />
                      <AdminButton type="submit" size="sm" variant="outline">
                        <PlusIcon aria-hidden />
                        {t("addLesson")}
                      </AdminButton>
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
                </AdminCard>
              );
            })}
            <form action={createSection}>
              <input type="hidden" name="courseId" value={course.id} />
              <AdminButton
                type="submit"
                variant="outline"
                size="sm"
                className="w-fit"
              >
                <PlusIcon aria-hidden />
                {t("addSection")}
              </AdminButton>
            </form>
          </div>
        );
      })}
    </div>
  );
}
