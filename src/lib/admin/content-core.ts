import { randomUUID } from "node:crypto";
import type { Json } from "@/lib/database.types";
import type { createAdminWrite } from "./admin-write-core";
import { CRUD, type CrudTable, parseCrudForm } from "./crud";

type AdminWrite = ReturnType<typeof createAdminWrite>["adminWrite"];

/**
 * Inserts or updates one row of a configured CRUD table, audited. The table
 * name is whitelisted by `CRUD`, so the dynamic query cannot touch anything else.
 */
export async function saveCrudRow(
  adminWrite: AdminWrite,
  table: CrudTable,
  id: string | null,
  get: (name: string) => string | null,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const config = CRUD[table];
  const parsed = parseCrudForm(config.fields, get);
  if (!parsed.ok) return parsed;
  const values: Record<string, unknown> = { ...parsed.values };
  if ("publishedAt" in config && config.publishedAt && values.published) {
    values.published_at = new Date().toISOString();
  }
  // Created rows get their id up front so the audit row can name them.
  const rowId = id ?? randomUUID();
  const savedId = await adminWrite({
    action: `${table}.${id ? "update" : "create"}`,
    entity: table,
    entityId: rowId,
    run: async (svc) => {
      const q = svc.from(table);
      const res = id
        ? await q
            .update(values as never)
            .eq("id", id)
            .select("id")
            .single()
        : await q
            .insert({ ...values, id: rowId } as never)
            .select("id")
            .single();
      if (res.error) throw res.error;
      return (res.data as { id: string }).id;
    },
    after: () => values as Json,
  });
  return { ok: true, id: savedId };
}

export async function deleteCrudRow(
  adminWrite: AdminWrite,
  table: CrudTable,
  id: string,
): Promise<void> {
  await adminWrite({
    action: `${table}.delete`,
    entity: table,
    entityId: id,
    run: async (svc) => {
      const { error } = await svc.from(table).delete().eq("id", id);
      if (error) throw error;
    },
  });
}
