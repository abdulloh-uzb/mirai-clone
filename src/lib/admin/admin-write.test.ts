import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { AdminOnlyError, createAdminWrite } from "./admin-write-core";

function setup(role: string | null) {
  const insert = vi.fn().mockResolvedValue({ error: null });
  const from = vi.fn().mockReturnValue({ insert });
  const service = { from } as unknown as SupabaseClient<Database>;
  const { adminWrite } = createAdminWrite({
    getAccount: async () => (role ? { userId: "admin-1", role } : null),
    service: () => service,
  });
  return { adminWrite, insert, from };
}

describe("adminWrite", () => {
  it("refuses a Student and runs nothing", async () => {
    const { adminWrite, insert } = setup("student");
    const run = vi.fn();
    await expect(
      adminWrite({ action: "x", entity: "enrollments", run }),
    ).rejects.toBeInstanceOf(AdminOnlyError);
    expect(run).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("refuses a Visitor", async () => {
    const { adminWrite } = setup(null);
    await expect(
      adminWrite({ action: "x", entity: "e", run: async () => 1 }),
    ).rejects.toBeInstanceOf(AdminOnlyError);
  });

  it("audits before, after and reason", async () => {
    const { adminWrite, insert, from } = setup("admin");
    const result = await adminWrite({
      action: "enrollment.extend",
      entity: "enrollments",
      entityId: "enr-1",
      before: { expires_at: "a" },
      run: async () => ({ expires_at: "b" }),
      after: (r) => r,
      reason: "Customer asked",
    });
    expect(result).toEqual({ expires_at: "b" });
    expect(from).toHaveBeenCalledWith("audit_log");
    expect(insert).toHaveBeenCalledWith({
      actor_id: "admin-1",
      action: "enrollment.extend",
      entity: "enrollments",
      entity_id: "enr-1",
      before: { expires_at: "a" },
      after: { expires_at: "b", reason: "Customer asked" },
    });
  });
});
