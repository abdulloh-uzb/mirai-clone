import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { BlockRenderer } from "@/components/course/blocks/block-renderer";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { deleteBlock, saveBlock } from "@/lib/admin/content-actions";
import {
  BLOCK_TYPES,
  COURSE_LOCALES,
  parseBlockContent,
} from "@/lib/course/blocks";
import { createServiceClient } from "@/lib/supabase/service";

const field = "rounded-md border bg-background px-2 py-1 text-sm";

async function BlockForm({
  lessonId,
  block,
  locale,
}: {
  locale: Locale;
  lessonId: string;
  block: {
    id: string;
    position: number;
    type: string;
    content: unknown;
  } | null;
}) {
  const t = await getTranslations({ locale, namespace: "Admin.lesson" });
  const content = (block?.content ?? {}) as Record<string, unknown>;
  return (
    <form action={saveBlock} className="mt-2 flex flex-col gap-3">
      <input type="hidden" name="lessonId" value={lessonId} />
      {block ? <input type="hidden" name="id" value={block.id} /> : null}
      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-sm">
          {t("position")}
          <input
            name="position"
            type="number"
            min={1}
            defaultValue={block?.position}
            required
            className={field}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {t("type")}
          <select name="type" defaultValue={block?.type} className={field}>
            {BLOCK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      {COURSE_LOCALES.map((l) => (
        <label key={l} className="flex flex-col gap-1 text-sm">
          {l === "en"
            ? t("contentLabel", { locale: l })
            : t("contentLabelBlank", { locale: l })}
          <textarea
            name={`content_${l}`}
            rows={5}
            defaultValue={content[l] ? JSON.stringify(content[l], null, 2) : ""}
            className={`${field} font-mono`}
          />
        </label>
      ))}
      <button
        type="submit"
        className="w-fit rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
      >
        {block ? t("saveBlock") : t("addBlock")}
      </button>
    </form>
  );
}

export default async function AdminLessonPage({
  params,
}: PageProps<"/[locale]/admin/content/lessons/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const t = await getTranslations({ locale, namespace: "Admin.lesson" });
  const tc = await getTranslations({ locale, namespace: "Admin.common" });
  const svc = createServiceClient();
  const { data: lesson } = await svc
    .from("lessons")
    .select("id, title")
    .eq("id", id)
    .maybeSingle();
  if (!lesson) notFound();
  const { data: blocks } = await svc
    .from("lesson_blocks")
    .select("id, position, type, content")
    .eq("lesson_id", id)
    .order("position");
  const title =
    (lesson.title as Record<string, string>).en ?? t("fallbackTitle");

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <div className="mt-4 flex flex-col gap-2">
        {(blocks ?? []).map((b) => {
          let preview: React.ReactNode = (
            <p className="text-sm text-destructive">{t("invalid")}</p>
          );
          try {
            const type = b.type as (typeof BLOCK_TYPES)[number];
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
          return (
            <details key={b.id} className="rounded-md border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                {b.position}. {b.type}
              </summary>
              <BlockForm lessonId={id} block={b} locale={locale} />
              <form action={deleteBlock} className="mt-2">
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="text-sm text-destructive">
                  {tc("delete")}
                </button>
              </form>
              <h3 className="mt-4 text-sm font-semibold">{t("preview")}</h3>
              <div className="mt-2 rounded-md border p-3">{preview}</div>
            </details>
          );
        })}
        <details className="rounded-md border border-dashed p-3">
          <summary className="cursor-pointer text-sm font-medium">
            {t("newBlock")}
          </summary>
          <BlockForm lessonId={id} block={null} locale={locale} />
        </details>
      </div>
    </section>
  );
}
