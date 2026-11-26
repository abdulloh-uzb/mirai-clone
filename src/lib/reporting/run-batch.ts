import "server-only";
import { getEmailSender } from "@/lib/email";
import { reportStatusEmail } from "@/lib/email/report-templates";
import { routing, type Locale } from "@/i18n/routing";
import { createServiceClient } from "@/lib/supabase/service";
import { adapterFor } from "./adapters";
import { runBatch, type BatchCounts } from "./run-batch-core";

/** Runs one reporting batch with the service client, the state adapters and email. */
export async function runReportBatch(input: {
  trigger: "cron" | "manual";
  now?: Date;
}): Promise<BatchCounts> {
  const service = createServiceClient();
  return runBatch(
    {
      service,
      adapterFor,
      async notify({ userId, status }) {
        const { data } = await service.auth.admin.getUserById(userId);
        const to = data.user?.email;
        if (!to) return;
        const { data: profile } = await service
          .from("profiles")
          .select("first_name, preferred_locale")
          .eq("user_id", userId)
          .single();
        const locale = (routing.locales as readonly string[]).includes(
          profile?.preferred_locale ?? "",
        )
          ? (profile?.preferred_locale as Locale)
          : routing.defaultLocale;
        await getEmailSender().send({
          to,
          ...reportStatusEmail({
            locale,
            status,
            name: profile?.first_name ?? "",
          }),
        });
      },
    },
    { trigger: input.trigger, now: input.now ?? new Date() },
  );
}
