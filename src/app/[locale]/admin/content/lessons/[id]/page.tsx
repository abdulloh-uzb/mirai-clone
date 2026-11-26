import { readdir } from "node:fs/promises";
import path from "node:path";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <section className="flex flex-col gap-6">
      <nav className="text-sm">
        <Link
          href="/admin/content"
          className="font-bold text-blue-text hover:underline"
        >
          ← {t("back")}
        </Link>
      </nav>
      <header className="flex flex-wrap items-center gap-3">
        {section ? (
          <Badge tone="info">
            {t("section", { n: section.position })} · {lesson.position}
          </Badge>
        ) : null}
        <h1 className="min-w-0 flex-1 text-3xl font-bold tracking-tight">
          {titles.en ?? "—"}
        </h1>
        <form action={deleteLesson}>
          <input type="hidden" name="id" value={lesson.id} />
          <input type="hidden" name="locale" value={locale} />
          <ConfirmSubmit
            size="sm"
            label={t("deleteLesson")}
            question={t("deleteLessonConfirm")}
          />
        </form>
      </header>

      <Card>
        <h2 className="text-xl font-bold">{t("lessonDetails")}</h2>
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
      </Card>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold">{t("blocksTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("blocksIntro")}</p>
        </div>

        {list.length === 0 ? (
          <Card variant="tint">
            <p className="text-muted-foreground">{t("noBlocks")}</p>
          </Card>
        ) : null}

        {list.map((b, i) => {
          if (!isBlockType(b.type)) return null;
          const type = b.type;
          let preview: React.ReactNode = (
            <p className="text-sm font-bold text-alert">{t("invalid")}</p>
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
            <Card key={b.id} padding="none">
              <div className="flex flex-wrap items-center gap-2 border-b border-line-blue px-5 py-3">
                <span className="text-sm font-bold text-muted-foreground">
                  {i + 1}.
                </span>
                <Badge tone="info">{t(`types.${type}`)}</Badge>
                <span className="flex flex-1 gap-1">
                  {COURSE_LOCALES.map((l) => (
                    <Badge
                      key={l}
                      tone={content[l] ? "success" : "danger"}
                      title={content[l] ? t("translated") : t("missing")}
                      className="px-1.5 text-[11px] uppercase"
                    >
                      {l}
                    </Badge>
                  ))}
                </span>
                <form action={moveBlock} className="contents">
                  <input type="hidden" name="id" value={b.id} />
                  <Button
                    type="submit"
                    name="dir"
                    value="up"
                    variant="ghost"
                    size="icon-xs"
                    disabled={i === 0}
                    aria-label={t("moveUp")}
                    title={t("moveUp")}
                  >
                    ↑
                  </Button>
                  <Button
                    type="submit"
                    name="dir"
                    value="down"
                    variant="ghost"
                    size="icon-xs"
                    disabled={i === list.length - 1}
                    aria-label={t("moveDown")}
                    title={t("moveDown")}
                  >
                    ↓
                  </Button>
                </form>
                <EditToggle label={t("edit")}>
                  <div className="mt-2 rounded-[18px] border border-line-blue bg-surface p-4">
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
              <div className="px-5 py-4">{preview}</div>
            </Card>
          );
        })}

        <div>
          <AddBlock lessonId={lesson.id} images={images} captions={captions} />
        </div>
      </div>
    </section>
  );
}
