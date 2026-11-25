import "server-only";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { createServiceClient } from "@/lib/supabase/service";
import { createAdminWrite } from "./admin-write-core";

/**
 * Every Admin write goes through here: role check, service-client write, then
 * an audit_log row. `requireAdmin()` is for Admin reads that need the service
 * client.
 */
export const { adminWrite, requireAdmin } = createAdminWrite({
  getAccount: getCurrentAccount,
  service: createServiceClient,
});

export { AdminOnlyError } from "./admin-write-core";
