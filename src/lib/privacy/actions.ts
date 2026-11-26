"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Files an account deletion request as a `contact` ticket for an Admin to review.
 * TODO(spec): completion records are retained 3 years (spec), so deletion is
 * reviewed by an Admin instead of being automatic.
 */
export async function requestAccountDeletion(): Promise<void> {
  const account = await getCurrentAccount();
  if (!account) return;
  const service = createServiceClient();
  const { data: existing } = await service
    .from("tickets")
    .select("id")
    .eq("user_id", account.userId)
    .eq("status", "open")
    .contains("details", { kind: "deletion_request" })
    .limit(1);
  if (!existing?.length) {
    const { error } = await service.from("tickets").insert({
      type: "contact",
      user_id: account.userId,
      email: account.email,
      body: "Deletion request: please delete my account and personal data.",
      details: { kind: "deletion_request", subject: "Deletion request" },
    });
    if (error) throw error;
  }
  revalidatePath("/[locale]/(site)/portal/privacy", "page");
}
