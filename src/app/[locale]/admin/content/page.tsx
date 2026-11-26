import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { CrudList } from "@/components/admin/crud-list";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { requireAdmin } from "@/lib/admin/admin-write";
import { COURSE_LOCALES } from "@/lib/course/blocks";
import { createServiceClient } from "@/lib/supabase/service";

function titleOf(title: unknown): string {
  const t = (title ?? {}) as Record<string, string>;
  return t.en ?? Object.values(t)[0] ?? "(untitled)";
}

function missing(content: unknown): string[] {
  const c = (content ?? {}) as Record<string, unknown>;
  return COURSE_LOCALES.filter((l) => !c[l]);
}

export default async function AdminContentPage({
  params,
}: PageProps<"/[locale]/admin/content">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin();
  const svc = createServiceClient();
  const [courses, sections, lessons, blocks] = await Promise.all([
    svc.from("courses").select("id, slug"),
    svc.from("sections").select("*").order("position"),
    svc.from("lessons").select("*").order("position"),
    svc.from("lesson_blocks").select("id, lesson_id, position, content"),
  ]);
  const sectionOptions = (sections.data ?? []).map((s) => ({
    value: s.id,
    label: `${s.position}. ${titleOf(s.title)}`,
  }));
  const courseOptions = (courses.data ?? []).map((c) => ({
    value: c.id,
    label: c.slug,
  }));

  // Translation status: lessons/blocks missing a locale.
  const blocksByLesson = new Map<string, typeof blocks.data>();
  for (const b of blocks.data ?? []) {
    blocksByLesson.set(b.lesson_id, [
      ...(blocksByLesson.get(b.lesson_id) ?? []),
      b,
    ]);
  }

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Content</h1>
      <p className="mt-2 text-sm">
        <Link href="/admin/content/questions" className="underline">
          Question bank
        </Link>
      </p>

      <h2 className="mt-8 text-xl font-semibold">Sections</h2>
      <CrudList
        table="sections"
        rows={sections.data ?? []}
        selectOptions={{ course_id: courseOptions }}
        describe={(r) => `${r.position}. ${titleOf(r.title)}`}
      />

      <h2 className="mt-8 text-xl font-semibold">Lessons</h2>
      <CrudList
        table="lessons"
        rows={lessons.data ?? []}
        selectOptions={{ section_id: sectionOptions }}
        describe={(r) => `${r.position}. ${titleOf(r.title)}`}
      />

      <h2 className="mt-8 text-xl font-semibold">Translation status</h2>
      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 pr-4">Lesson</th>
            <th className="py-2 pr-4">Blocks</th>
            <th className="py-2 pr-4">Missing titles</th>
            <th className="py-2 pr-4">Missing block content</th>
          </tr>
        </thead>
        <tbody>
          {(lessons.data ?? []).map((l) => {
            const bs = blocksByLesson.get(l.id) ?? [];
            const gaps = new Set(bs.flatMap((b) => missing(b.content)));
            const titleGaps = missing(l.title);
            return (
              <tr key={l.id} className="border-b">
                <td className="py-2 pr-4">
                  <Link
                    href={`/admin/content/lessons/${l.id}`}
                    className="underline"
                  >
                    {titleOf(l.title)}
                  </Link>
                </td>
                <td className="py-2 pr-4">{bs.length}</td>
                <td className="py-2 pr-4">{titleGaps.join(", ") || "none"}</td>
                <td className="py-2 pr-4">{[...gaps].join(", ") || "none"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
