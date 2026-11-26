import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { createAdminWrite } from "../../src/lib/admin/admin-write-core";
import { deleteCrudRow, saveCrudRow } from "../../src/lib/admin/content-core";
import {
  serviceClient,
  signInAsAdmin,
  signInAsStudent,
  deleteTestUsers,
} from "../support/users";

afterAll(async () => {
  await deleteTestUsers();
});

describe("admin content tables", () => {
  it("a student cannot write any of them directly", async () => {
    const student = await signInAsStudent();
    const tables = [
      "faq_items",
      "pages",
      "posts",
      "changelog",
      "reviews",
      "announcements",
      "courts",
      "counties",
      "courses",
      "states",
      "sections",
      "lessons",
      "lesson_blocks",
      "questions",
      "tickets",
    ] as const;
    for (const t of tables) {
      const { data } = await student.client
        .from(t)
        .update({ updated_at: new Date().toISOString() } as never)
        .not("id", "is", null)
        .select();
      expect(data ?? [], t).toHaveLength(0);
      const ins = await student.client.from(t).insert({} as never);
      expect(ins.error, t).not.toBeNull();
    }
  });

  it("an admin save and delete each write an audit row", async () => {
    const admin = await signInAsAdmin();
    const adminWrite = createAdminWrite({
      getAccount: async () => ({ userId: admin.id, role: "admin" }),
      service: () => serviceClient,
    }).adminWrite;
    const slug = `t-${randomUUID().slice(0, 8)}`;
    const values: Record<string, string> = {
      locale: "en",
      slug,
      title: "Hello",
      body: "Body",
      category: "about",
      position: "1",
      published: "on",
    };
    const saved = await saveCrudRow(
      adminWrite,
      "faq_items",
      null,
      (n) => values[n] ?? null,
    );
    expect(saved.ok).toBe(true);
    if (!saved.ok) return;
    const { data: row } = await serviceClient
      .from("faq_items")
      .select("title")
      .eq("id", saved.id)
      .single();
    expect(row?.title).toBe("Hello");

    await deleteCrudRow(adminWrite, "faq_items", saved.id);
    const { data: audit } = await serviceClient
      .from("audit_log")
      .select("action, actor_id")
      .eq("entity_id", saved.id);
    expect(audit?.map((a) => a.action).sort()).toEqual([
      "faq_items.create",
      "faq_items.delete",
    ]);
    expect(audit?.every((a) => a.actor_id === admin.id)).toBe(true);
  });

  it("rejects invalid input without writing", async () => {
    const admin = await signInAsAdmin();
    const adminWrite = createAdminWrite({
      getAccount: async () => ({ userId: admin.id, role: "admin" }),
      service: () => serviceClient,
    }).adminWrite;
    const res = await saveCrudRow(adminWrite, "pages", null, () => null);
    expect(res.ok).toBe(false);
  });
});
