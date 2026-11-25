import "server-only";
import { requireAdmin } from "@/lib/admin/admin-write";
import { createServiceClient } from "@/lib/supabase/service";

/** user id to email, for one page of Admin rows. Admin only. */
export async function emailsFor(
  userIds: string[],
): Promise<Record<string, string>> {
  await requireAdmin();
  const svc = createServiceClient();
  const unique = [...new Set(userIds)];
  const entries = await Promise.all(
    unique.map(async (id) => {
      const { data } = await svc.auth.admin.getUserById(id);
      return [id, data.user?.email ?? ""] as const;
    }),
  );
  return Object.fromEntries(entries);
}
