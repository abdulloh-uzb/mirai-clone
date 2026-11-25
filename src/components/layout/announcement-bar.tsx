import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n/routing";
import { getPublishedAnnouncement } from "@/lib/announcements";
import {
  DISMISSED_ANNOUNCEMENTS_COOKIE,
  parseDismissed,
} from "@/lib/dismissed-announcements";
import { ReportProblem } from "@/components/support/report-problem";
import { Link } from "@/i18n/navigation";
import { DismissibleAnnouncement } from "./dismissible-announcement";

/** Top bar with the current published announcement for the UI language. */
export async function AnnouncementBar({ locale }: { locale: Locale }) {
  const announcement = await getPublishedAnnouncement(locale);
  if (!announcement) return null;

  const cookieStore = await cookies();
  const dismissed = parseDismissed(
    cookieStore.get(DISMISSED_ANNOUNCEMENTS_COOKIE)?.value,
  );
  if (dismissed.includes(announcement.id)) return null;

  const t = await getTranslations({ locale, namespace: "AnnouncementBar" });
  return (
    <DismissibleAnnouncement
      id={announcement.id}
      message={announcement.message}
      label={t("label")}
      dismissLabel={t("dismiss")}
      action={
        <>
          <Link
            href="/whats-new"
            className="hidden shrink-0 rounded-sm font-bold text-[#0a6aa8] underline underline-offset-2 hover:no-underline sm:inline dark:text-primary"
          >
            {t("whatsNew")}
          </Link>
          <ReportProblem className="shrink-0 rounded-sm font-bold text-[#0a6aa8] underline underline-offset-2 hover:no-underline dark:text-primary" />
        </>
      }
    />
  );
}
