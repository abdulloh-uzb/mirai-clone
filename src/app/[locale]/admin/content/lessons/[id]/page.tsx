import { readdir } from "node:fs/promises";
import path from "node:path";
import { ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  AddBlock,
  BlockEditor,
  ConfirmSubmit,
  EditToggle,
  LessonDetailsForm,
} from "@/components/admin/course-editor";
import { BlockRenderer } from "@/components/course/blocks/block-renderer";
import { LANGUAGE_NAMES, LangBadge } from "@/components/admin/lang-badge";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminBadge } from "@/components/admin/ui/badge";
import { AdminButton } from "@/components/admin/ui/button";
import {
  AdminCard,
  AdminCardContent,
  AdminCardHeader,
  AdminCardTitle,
} from "@/components/admin/ui/card";
import { AdminEmpty } from "@/components/admin/ui/empty";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { deleteBlock } from "@/lib/admin/content-actions";
import { deleteLesson, moveBlock } from "@/lib/admin/course-actions";
import {
  BLOCK_TYPES,
  COURSE_LOCALES,
  parseBlockContent,
  type BlockType,
  type CourseLocale,
} from "@/lib/course/blocks";
import { createServiceClient } from "@/lib/supabase/service";

type Titles = Partial<Record<CourseLocale, string>>;

/** Files block editors can pick: the placeholder pictures and caption tracks. */
async function placeholderFiles(dir: string, ext: string): Promise<string[]> {
  const base = "/placeholder/course" + (dir ? `/${dir}` : "");
  try {
    const files = await readdir(path.join(process.cwd(), "public", base));
    return files
      .filter((f) => f.endsWith(ext))
      .sort()
      .map((f) => `${base}/${f}`);
  } catch {
    return [];
  }
}

function isBlockType(v: string): v is BlockType {
  return (BLOCK_TYPES as readonly string[]).includes(v);
}

export default async function AdminLessonPage({
  params,
}: PageProps<"/[locale]/admin/content/lessons/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.editor" });
  const svc = createServiceClient();
  const { data: lesson } = await svc
    .from("lessons")
    .select("id, title, position, min_seconds, section_id")
    .eq("id", id)
    .maybeSingle();
  if (!lesson) notFound();
  const [{ data: blocks }, { data: sections }, images, captions] =
    await Promise.all([
      svc
        .from("lesson_blocks")
        .select("id, position, type, content")
        .eq("lesson_id", id)
        .order("position"),
      svc.from("sections").select("id, position, title").order("position"),
      placeholderFiles("", ".svg"),
      placeholderFiles("captions", ".vtt"),
    ]);
  const titles = (lesson.title ?? {}) as Titles;
  const section = (sections ?? []).find((s) => s.id === lesson.section_id);
  const sectionOptions = (sections ?? []).map((s) => ({
    value: s.id,
    label: `${t("section", { n: s.position })} · ${
      (s.title as Titles).en ?? "—"
    }`,
  }));
  const list = blocks ?? [];

  return (
    <div className="flex flex-col gap-6">
      <AdminButton asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link href="/admin/content">
          <ArrowLeftIcon aria-hidden />
          {t("back")}
        </Link>
      </AdminButton>
      <AdminPageHeader
        title={titles.en ?? "—"}
        meta={
          section ? (
            <AdminBadge tone="info">
              {t("section", { n: section.position })} · {lesson.position}
            </AdminBadge>
          ) : null
        }
        actions={
          <form action={deleteLesson}>
            <input type="hidden" name="id" value={lesson.id} />
            <input type="hidden" name="locale" value={locale} />
            <ConfirmSubmit
              size="sm"
              label={t("deleteLesson")}
              question={t("deleteLessonConfirm")}
            />
          </form>
        }
      />

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>{t("lessonDetails")}</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent>
          <LessonDetailsForm
            lesson={{
              id: lesson.id,
              sectionId: lesson.section_id,
              position: lesson.position,
              minSeconds: lesson.min_seconds,
              titles,
            }}
            sections={sectionOptions}
          />
        </AdminCardContent>
      </AdminCard>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">{t("blocksTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("blocksIntro")}
          </p>
        </div>

        {list.length === 0 ? (
          <AdminCard>
            <AdminEmpty title={t("noBlocks")} />
          </AdminCard>
        ) : null}

        {list.map((b, i) => {
          if (!isBlockType(b.type)) return null;
          const type = b.type;
          let preview: React.ReactNode = (
            <p className="text-sm font-medium text-red-700 dark:text-red-400">
              {t("invalid")}
            </p>
          );
          try {
            preview = (
              <BlockRenderer
                block={{
                  id: b.id,
                  position: b.position,
                  type,
                  content: parseBlockContent(type, b.content, "en"),
                }}
              />
            );
          } catch {
            // keep the invalid-content notice
          }
          const content = (b.content ?? {}) as Titles;
          return (
            <AdminCard key={b.id}>
              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5">
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {i + 1}.
                </span>
                <AdminBadge tone="info">{t(`types.${type}`)}</AdminBadge>
                <span className="flex flex-1 gap-1">
                  {COURSE_LOCALES.map((l) => (
                    <LangBadge
                      key={l}
                      code={l}
                      ok={Boolean(content[l])}
                      tip={t(content[l] ? "langDone" : "blockMissing", {
                        language: LANGUAGE_NAMES[l],
                      })}
                    />
                  ))}
                </span>
                <form action={moveBlock} className="contents">
                  <input type="hidden" name="id" value={b.id} />
                  <AdminButton
                    type="submit"
                    name="dir"
                    value="up"
                    variant="ghost"
                    size="icon-xs"
                    disabled={i === 0}
                    aria-label={t("moveUp")}
                    title={t("moveUp")}
                  >
                    <ArrowUpIcon aria-hidden />
                  </AdminButton>
                  <AdminButton
                    type="submit"
                    name="dir"
                    value="down"
                    variant="ghost"
                    size="icon-xs"
                    disabled={i === list.length - 1}
                    aria-label={t("moveDown")}
                    title={t("moveDown")}
                  >
                    <ArrowDownIcon aria-hidden />
                  </AdminButton>
                </form>
                <EditToggle label={t("edit")}>
                  <div className="mt-2 rounded-lg border bg-muted/30 p-4">
                    <BlockEditor
                      lessonId={lesson.id}
                      block={{ id: b.id, type, content: b.content }}
                      images={images}
                      captions={captions}
                    />
                  </div>
                </EditToggle>
                <form action={deleteBlock}>
                  <input type="hidden" name="id" value={b.id} />
                  <ConfirmSubmit
                    label={t("delete")}
                    question={t("deleteBlockConfirm")}
                  />
                </form>
              </div>
              <div className="px-4 py-4">{preview}</div>
            </AdminCard>
          );
        })}

        <div>
          <AddBlock lessonId={lesson.id} images={images} captions={captions} />
        </div>
      </div>
    </div>
  );
}
