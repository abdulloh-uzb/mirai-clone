"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminWrite } from "@/lib/admin/admin-write";
import { parseBlockForm } from "@/lib/admin/block-form";
import { BLOCK_TYPES, COURSE_LOCALES } from "@/lib/course/blocks";
import { localeSchema } from "@/lib/validation/auth";
import { redirect } from "@/i18n/navigation";

// Server actions for the course editor (Admin › Content): sections, lessons
// and lesson blocks, posted as plain form fields. Each write goes through
// adminWrite (role check + audit_log). Form actions return a state the editor
// shows next to the Save button instead of throwing to the error page.

export type FormState = { status: "idle" | "saved" | "error"; error?: string };

const uuid = z.uuid();

function str(formData: FormData, name: string): string {
  const v = formData.get(name);
  return typeof v === "string" ? v : "";
}

/** `{ en, ja, es, ru }` from `title_<locale>` fields, leaving blanks out. */
function titlesOf(formData: FormData): Record<string, string> {
  const title: Record<string, string> = {};
  for (const l of COURSE_LOCALES) {
    const v = str(formData, `title_${l}`).trim();
    if (v) title[l] = v;
  }
  return title;
}

function message(error: unknown): string {
  const e = error as { code?: string; message?: string };
  // unique (parent_id, position)
  if (e.code === "23505") return "position_taken";
  return e.message ?? "generic";
}

function done(): FormState {
  revalidatePath("/", "layout");
  return { status: "saved" };
}

/** One past the highest position among the rows a query selects. */
async function nextPosition(
  query: PromiseLike<{
    data: { position: number }[] | null;
    error: unknown;
  }>,
): Promise<number> {
  const { data, error } = await query;
  if (error) throw error;
  return Math.max(0, ...(data ?? []).map((r) => r.position)) + 1;
}

// ---- Sections --------------------------------------------------------------

export async function createSection(formData: FormData): Promise<void> {
  const courseId = uuid.parse(formData.get("courseId"));
  await adminWrite({
    action: "sections.create",
    entity: "sections",
    run: async (svc) => {
      const position = await nextPosition(
        svc.from("sections").select("position").eq("course_id", courseId),
      );
      const { error } = await svc.from("sections").insert({
        course_id: courseId,
        position,
        title: { en: `Section ${position}` },
      });
      if (error) throw error;
    },
  });
  revalidatePath("/", "layout");
}

export async function saveSection(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = uuid.parse(formData.get("id"));
  const title = titlesOf(formData);
  if (!title.en) return { status: "error", error: "english_title" };
  try {
    await adminWrite({
      action: "sections.update",
      entity: "sections",
      entityId: id,
      run: async (svc) => {
        const { error } = await svc
          .from("sections")
          .update({ title })
          .eq("id", id);
        if (error) throw error;
      },
      after: () => ({ title }),
    });
  } catch (error) {
    return { status: "error", error: message(error) };
  }
  return done();
}

export async function deleteSection(formData: FormData): Promise<void> {
  const id = uuid.parse(formData.get("id"));
  await adminWrite({
    action: "sections.delete",
    entity: "sections",
    entityId: id,
    run: async (svc) => {
      const { error } = await svc.from("sections").delete().eq("id", id);
      if (error) throw error;
    },
  });
  revalidatePath("/", "layout");
}

// ---- Lessons ---------------------------------------------------------------

/** Adds an empty lesson at the end of a section and opens its editor. */
export async function createLesson(formData: FormData): Promise<void> {
  const sectionId = uuid.parse(formData.get("sectionId"));
  const locale = localeSchema.parse(formData.get("locale"));
  const id = await adminWrite({
    action: "lessons.create",
    entity: "lessons",
    run: async (svc) => {
      const position = await nextPosition(
        svc.from("lessons").select("position").eq("section_id", sectionId),
      );
      const { data, error } = await svc
        .from("lessons")
        .insert({
          section_id: sectionId,
          position,
          min_seconds: 300,
          title: { en: "New lesson" },
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    after: (lessonId) => ({ id: lessonId }),
  });
  revalidatePath("/", "layout");
  redirect({ href: `/admin/content/lessons/${id}`, locale });
}

const lessonSchema = z.object({
  id: z.uuid(),
  sectionId: z.uuid(),
  position: z.coerce.number().int().min(1),
  minMinutes: z.coerce.number().min(0).max(600),
});

export async function saveLesson(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = lessonSchema.safeParse({
    id: formData.get("id"),
    sectionId: formData.get("sectionId"),
    position: formData.get("position"),
    minMinutes: formData.get("minMinutes"),
  });
  if (!parsed.success) return { status: "error", error: "invalid" };
  const title = titlesOf(formData);
  if (!title.en) return { status: "error", error: "english_title" };
  const { id, sectionId, position, minMinutes } = parsed.data;
  const row = {
    section_id: sectionId,
    position,
    min_seconds: Math.round(minMinutes * 60),
    title,
  };
  try {
    await adminWrite({
      action: "lessons.update",
      entity: "lessons",
      entityId: id,
      run: async (svc) => {
        const { error } = await svc.from("lessons").update(row).eq("id", id);
        if (error) throw error;
      },
      after: () => row,
    });
  } catch (error) {
    return { status: "error", error: message(error) };
  }
  return done();
}

export async function deleteLesson(formData: FormData): Promise<void> {
  const id = uuid.parse(formData.get("id"));
  const locale = localeSchema.parse(formData.get("locale"));
  await adminWrite({
    action: "lessons.delete",
    entity: "lessons",
    entityId: id,
    run: async (svc) => {
      const { error } = await svc.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
  });
  revalidatePath("/", "layout");
  redirect({ href: "/admin/content", locale });
}

// ---- Blocks ----------------------------------------------------------------

const blockHead = z.object({
  id: z.uuid().optional(),
  lessonId: z.uuid(),
  type: z.enum(BLOCK_TYPES),
});

export async function saveBlockFields(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const idRaw = str(formData, "id");
  const head = blockHead.safeParse({
    id: idRaw || undefined,
    lessonId: formData.get("lessonId"),
    type: formData.get("type"),
  });
  if (!head.success) return { status: "error", error: "invalid" };
  const { id, lessonId, type } = head.data;
  const parsed = parseBlockForm(type, (n) => str(formData, n));
  if (!parsed.ok) {
    return {
      status: "error",
      error: `${parsed.locale.toUpperCase()} — ${parsed.message}`,
    };
  }
  const content = parsed.content;
  try {
    await adminWrite({
      action: id ? "lesson_blocks.update" : "lesson_blocks.create",
      entity: "lesson_blocks",
      entityId: id ?? null,
      run: async (svc) => {
        if (id) {
          const { error } = await svc
            .from("lesson_blocks")
            .update({ type, content: content as never })
            .eq("id", id);
          if (error) throw error;
          return;
        }
        const position = await nextPosition(
          svc
            .from("lesson_blocks")
            .select("position")
            .eq("lesson_id", lessonId),
        );
        const { error } = await svc.from("lesson_blocks").insert({
          lesson_id: lessonId,
          position,
          type,
          content: content as never,
        });
        if (error) throw error;
      },
      after: () => ({ type, locales: Object.keys(content) }),
    });
  } catch (error) {
    return { status: "error", error: message(error) };
  }
  return done();
}

/** Swaps a block with its neighbour above or below. */
export async function moveBlock(formData: FormData): Promise<void> {
  const id = uuid.parse(formData.get("id"));
  const dir = z.enum(["up", "down"]).parse(formData.get("dir"));
  await adminWrite({
    action: "lesson_blocks.move",
    entity: "lesson_blocks",
    entityId: id,
    run: async (svc) => {
      const { data: block, error } = await svc
        .from("lesson_blocks")
        .select("lesson_id, position")
        .eq("id", id)
        .single();
      if (error) throw error;
      const q = svc
        .from("lesson_blocks")
        .select("id, position")
        .eq("lesson_id", block.lesson_id);
      const { data: near, error: nearError } = await (
        dir === "up"
          ? q.lt("position", block.position).order("position", {
              ascending: false,
            })
          : q.gt("position", block.position).order("position")
      ).limit(1);
      if (nearError) throw nearError;
      const other = near?.[0];
      if (!other) return;
      // Through a free position: (lesson_id, position) is unique.
      const steps = [
        { id, position: 1_000_000 },
        { id: other.id, position: block.position },
        { id, position: other.position },
      ];
      for (const s of steps) {
        const { error: e } = await svc
          .from("lesson_blocks")
          .update({ position: s.position })
          .eq("id", s.id);
        if (e) throw e;
      }
    },
    after: () => ({ dir }),
  });
  revalidatePath("/", "layout");
}
