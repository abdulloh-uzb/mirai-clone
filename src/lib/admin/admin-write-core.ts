import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/database.types";

export type AdminAccount = { userId: string; role: string } | null;

export type AdminWriteDeps = {
  getAccount: () => Promise<AdminAccount>;
  service: () => SupabaseClient<Database>;
};

export type AdminWriteInput<T> = {
  /** Dotted verb, e.g. "enrollment.extend". */
  action: string;
  /** Table name, e.g. "enrollments". */
  entity: string;
  entityId?: string | null;
  before?: unknown;
  run: (service: SupabaseClient<Database>) => Promise<T>;
  after?: (result: T) => unknown;
  /** Why. Stored inside `after.reason`. */
  reason?: string;
};

export class AdminOnlyError extends Error {
  constructor() {
    super("admin only");
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Builds `adminWrite` over injectable dependencies (so it can be unit tested).
 * It checks the role, runs the write with the service client, then records an
 * audit_log row. If the audit insert fails the error is thrown to the caller.
 */
export function createAdminWrite(deps: AdminWriteDeps) {
  async function requireAdmin(): Promise<{ userId: string }> {
    const account = await deps.getAccount();
    if (account?.role !== "admin") throw new AdminOnlyError();
    return { userId: account.userId };
  }

  async function adminWrite<T>(input: AdminWriteInput<T>): Promise<T> {
    const { userId } = await requireAdmin();
    const service = deps.service();
    const result = await input.run(service);
    const afterValue = input.after ? input.after(result) : undefined;
    const after =
      input.reason !== undefined
        ? { ...(isObject(afterValue) ? afterValue : {}), reason: input.reason }
        : afterValue;
    const { error } = await service.from("audit_log").insert({
      actor_id: userId,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId ?? null,
      before: (input.before ?? null) as Json,
      after: (after ?? null) as Json,
    });
    if (error) throw error;
    return result;
  }

  return { adminWrite, requireAdmin };
}
