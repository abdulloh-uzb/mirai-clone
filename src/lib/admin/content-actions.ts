"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { adminWrite, requireAdmin } from "@/lib/admin/admin-write";
import { deleteCrudRow, saveCrudRow } from "@/lib/admin/content-core";
import { CRUD, isCrudTable } from "@/lib/admin/crud";
import { parseQuestionForm } from "@/lib/admin/question-form";
import {
  BLOCK_TYPES,
  COURSE_LOCALES,
  blockContentSchema,
} from "@/lib/course/blocks";
import { reindexKnowledgeBase } from "@/lib/ai/kb";
import { createServiceClient } from "@/lib/supabase/service";

// Admin server actions for Content, Courts, Site content, Tickets, Settings and
// AI. Every write goes through adminWrite (role check + audit_log). Invalid
// input throws, which shows Next's error page: fine for staff-only forms.

const uuid = z.uuid();

async function reindex() {
  await reindexKnowledgeBase(createServiceClient());
}

export async function saveRow(formData: FormData): Promise<void> {
  const table = formData.get("_table");
  if (!isCrudTable(table)) throw new Error("unknown table");
  const idRaw = formData.get("_id");
  const id = typeof idRaw === "string" && idRaw ? uuid.parse(idRaw) : null;
  const res = await saveCrudRow(adminWrite, table, id, (n) => {
    const v = formData.get(n);
    return typeof v === "string" ? v : null;
  });
  if (!res.ok) throw new Error(res.error);
  const config = CRUD[table];
  if (config.tag) revalidateTag(config.tag, "max");
  if (config.reindex) await reindex();
  revalidatePath("/", "layout");
}

export async function deleteRow(formData: FormData): Promise<void> {
  const table = formData.get("_table");
  if (!isCrudTable(table)) throw new Error("unknown table");
  await deleteCrudRow(adminWrite, table, uuid.parse(formData.get("_id")));
  const config = CRUD[table];
  if (config.tag) revalidateTag(config.tag, "max");
  if (config.reindex) await reindex();
  revalidatePath("/", "layout");
}

// ---- Lesson blocks ---------------------------------------------------------

const blockSchema = z.object({
  id: z.uuid().optional(),
  lessonId: z.uuid(),
  position: z.coerce.number().int().min(1),
  type: z.enum(BLOCK_TYPES),
});

export async function saveBlock(formData: FormData): Promise<void> {
  const idRaw = formData.get("id");
  const head = blockSchema.parse({
    id: typeof idRaw === "string" && idRaw ? idRaw : undefined,
    lessonId: formData.get("lessonId"),
    position: formData.get("position"),
    type: formData.get("type"),
  });
  const content: Record<string, unknown> = {};
  for (const l of COURSE_LOCALES) {
    const raw = formData.get(`content_${l}`);
    if (typeof raw !== "string" || !raw.trim()) {
      if (l === "en") throw new Error("English content is required");
      continue; // a missing locale is flagged in the translation matrix
    }
    content[l] = blockContentSchema(head.type).parse(JSON.parse(raw));
  }
  await adminWrite({
    action: head.id ? "lesson_blocks.update" : "lesson_blocks.create",
    entity: "lesson_blocks",
    entityId: head.id ?? null,
    run: async (svc) => {
      const row = {
        lesson_id: head.lessonId,
        position: head.position,
        type: head.type,
        content: content as never,
      };
      const q = svc.from("lesson_blocks");
      const { error } = head.id
        ? await q.update(row).eq("id", head.id)
        : await q.insert(row);
      if (error) throw error;
    },
    after: () => ({ type: head.type, locales: Object.keys(content) }),
  });
  revalidatePath("/", "layout");
}

export async function deleteBlock(formData: FormData): Promise<void> {
  await deleteCrudRowGeneric("lesson_blocks", formData);
}

async function deleteCrudRowGeneric(
  table: "lesson_blocks" | "questions",
  formData: FormData,
) {
  const id = uuid.parse(formData.get("id"));
  await adminWrite({
    action: `${table}.delete`,
    entity: table,
    entityId: id,
    run: async (svc) => {
      const { error } = await svc.from(table).delete().eq("id", id);
      if (error) throw error;
    },
  });
  revalidatePath("/", "layout");
}

// ---- Question bank ---------------------------------------------------------

export async function saveQuestion(formData: FormData): Promise<void> {
  const parsed = parseQuestionForm(formData);
  if (!parsed.success) throw new Error("exactly one correct option of four");
  const q = parsed.data;
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" && idRaw ? uuid.parse(idRaw) : null;
  await adminWrite({
    action: id ? "questions.update" : "questions.create",
    entity: "questions",
    entityId: id,
    run: async (svc) => {
      const row = {
        section_id: q.sectionId,
        locale: q.locale,
        text: q.text,
        explanation: q.explanation,
      };
      let qid = id;
      if (qid) {
        const { error } = await svc.from("questions").update(row).eq("id", qid);
        if (error) throw error;
        const del = await svc
          .from("answer_options")
          .delete()
          .eq("question_id", qid);
        if (del.error) throw del.error;
      } else {
        const ins = await svc
          .from("questions")
          .insert(row)
          .select("id")
          .single();
        if (ins.error) throw ins.error;
        qid = ins.data.id;
      }
      const { error } = await svc.from("answer_options").insert(
        q.options.map((text, i) => ({
          question_id: qid,
          text,
          is_correct: i === q.correct,
        })),
      );
      if (error) throw error;
      return qid;
    },
    after: () => ({ locale: q.locale, section_id: q.sectionId }),
  });
  revalidatePath("/", "layout");
}

export async function deleteQuestion(formData: FormData): Promise<void> {
  await deleteCrudRowGeneric("questions", formData);
}

// ---- Tickets ---------------------------------------------------------------

const ticketSchema = z.object({
  id: z.uuid(),
  status: z.enum(["open", "in_progress", "closed"]),
});

export async function setTicketStatus(formData: FormData): Promise<void> {
  const { id, status } = ticketSchema.parse(Object.fromEntries(formData));
  await requireAdmin();
  const { data: before } = await createServiceClient()
    .from("tickets")
    .select("status")
    .eq("id", id)
    .single();
  await adminWrite({
    action: "tickets.set_status",
    entity: "tickets",
    entityId: id,
    before,
    run: async (svc) => {
      const { error } = await svc
        .from("tickets")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      return { status };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

// ---- Admin accounts --------------------------------------------------------

export async function promoteAdmin(formData: FormData): Promise<void> {
  const email = z.email().parse(formData.get("email"));
  await adminWrite({
    action: "admin.promote",
    entity: "profiles",
    run: async (svc) => {
      const { data, error } = await svc.rpc("make_admin", {
        target_email: email,
      });
      if (error) throw error;
      return data;
    },
    after: (userId) => ({ user_id: userId, email }),
  });
  revalidatePath("/", "layout");
}

export async function demoteAdmin(formData: FormData): Promise<void> {
  const userId = uuid.parse(formData.get("userId"));
  const me = await requireAdmin();
  if (me.userId === userId) throw new Error("you cannot demote yourself");
  await adminWrite({
    action: "admin.demote",
    entity: "profiles",
    run: async (svc) => {
      const { error } = await svc
        .from("profiles")
        .update({ role: "student" })
        .eq("user_id", userId);
      if (error) throw error;
      return { user_id: userId };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

// ---- AI --------------------------------------------------------------------

export async function toggleMessageFlag(formData: FormData): Promise<void> {
  const id = uuid.parse(formData.get("id"));
  const flagged = formData.get("flagged") === "true";
  await adminWrite({
    action: flagged ? "ai_messages.flag" : "ai_messages.unflag",
    entity: "ai_messages",
    entityId: id,
    run: async (svc) => {
      const { error } = await svc
        .from("ai_messages")
        .update({ flagged })
        .eq("id", id);
      if (error) throw error;
      return { flagged };
    },
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}

export async function reindexKnowledgeBaseAction(): Promise<void> {
  await adminWrite({
    action: "kb.reindex",
    entity: "kb_chunks",
    run: async (svc) => ({ chunks: await reindexKnowledgeBase(svc) }),
    after: (r) => r,
  });
  revalidatePath("/", "layout");
}
