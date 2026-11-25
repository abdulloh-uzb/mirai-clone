import {
  ClipboardCheckIcon,
  AwardIcon,
  BookOpenCheckIcon,
  CalendarClockIcon,
  ClockIcon,
  EyeIcon,
  GavelIcon,
  type LucideIcon,
  MonitorSmartphoneIcon,
  SendIcon,
  ShieldCheckIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";
import { languages } from "@/i18n/languages";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { buyHref } from "@/lib/courses/course-language";
import { formatUsd } from "@/lib/courses/courses";

// Honesty rule: the school is a demo, so the last feature is "Built to DMV
// course rules (demo)", never a licence claim.
const FEATURES = [
  { key: "defensiveDriving", icon: ShieldCheckIcon },
  { key: "trafficViolations", icon: GavelIcon },
  { key: "driverAwareness", icon: EyeIcon },
  { key: "selfPaced", icon: ClockIcon },
  { key: "access", icon: CalendarClockIcon },
  { key: "interactive", icon: BookOpenCheckIcon },
  { key: "devices", icon: MonitorSmartphoneIcon },
  { key: "certificate", icon: AwardIcon },
  { key: "reported", icon: SendIcon },
  { key: "dmvRules", icon: ClipboardCheckIcon },
] as const satisfies readonly { key: string; icon: LucideIcon }[];

export async function CoursePanel({
  courseLanguage,
  locale,
  signedIn,
  priceCents,
  listPriceCents,
  accessDays,
  action,
}: {
  courseLanguage: Locale;
  locale: Locale;
  signedIn: boolean;
  priceCents: number;
  listPriceCents: number | null;
  accessDays: number;
  /** Replaces the buy link (the Portal renders a checkout form button here). */
  action?: ReactNode;
}) {
  const t = await getTranslations("Courses.panel");
  const language = languages[courseLanguage].nativeName;

  return (
    <section
      aria-labelledby="course-panel-title"
      className="rounded-3xl border-2 bg-card p-6 shadow-md md:p-8"
    >
      <span className="inline-block rounded-full bg-brand-green px-3 py-1 text-xs font-extrabold tracking-wide text-[#0f1217] uppercase">
        {t("pill")}
      </span>
      <h2
        id="course-panel-title"
        className="mt-3 text-3xl font-extrabold tracking-tight"
      >
        {t("title")}
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
        <ul className="grid gap-2 sm:grid-cols-2">
          {FEATURES.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-mint text-brand-green-ink"
              >
                <Icon className="size-4" />
              </span>
              {t(`features.${key}`, { days: accessDays })}
            </li>
          ))}
        </ul>
        <Image
          src="/placeholder/device-mockup.svg"
          alt={t("deviceAlt")}
          width={220}
          height={160}
          unoptimized
          className="mx-auto h-auto w-56"
        />
      </div>
      <p className="mt-6 font-medium">{t("inLanguage", { language })}</p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <p className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold">
            {formatUsd(priceCents, locale)}
          </span>
          {listPriceCents ? (
            <s className="text-muted-foreground">
              <span className="sr-only">{t("listPrice")} </span>
              {formatUsd(listPriceCents, locale)}
            </s>
          ) : null}
        </p>
        {action ?? (
          <Link
            href={buyHref(courseLanguage, signedIn)}
            className={buttonVariants({ size: "xl" })}
          >
            {t("start", { language })}
          </Link>
        )}
      </div>
    </section>
  );
}
