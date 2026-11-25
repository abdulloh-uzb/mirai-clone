import { getTranslations } from "next-intl/server";
import { getCurrentAccount } from "@/lib/auth/current-account";
import { BugReportDialog } from "./bug-report-dialog";

/**
 * The "Got a problem?" button for the announcement bar and the footer. Runs on
 * the server so the signed-in email comes from the session, not the browser.
 */
export async function ReportProblem({ className }: { className?: string }) {
  const [t, account] = await Promise.all([
    getTranslations("BugReport"),
    getCurrentAccount(),
  ]);
  return (
    <BugReportDialog
      accountEmail={account?.email}
      trigger={
        <button type="button" className={className}>
          {t("trigger")}
        </button>
      }
    />
  );
}
