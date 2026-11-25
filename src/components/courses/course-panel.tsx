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
}: {
  courseLanguage: Locale;
  locale: Locale;
  signedIn: boolean;
  priceCents: number;
  listPriceCents: number | null;
  accessDays: number;
}) {
  const t = await getTranslations("Courses.panel");
  const language = languages[courseLanguage].nativeName;

  return (
    <section
      aria-labelledby="course-panel-title"
      className="rounded-2xl border bg-card p-6 shadow-sm"
    >
      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        {t("pill")}
      </span>
      <h2
        id="course-panel-title"
        className="mt-3 text-2xl font-bold tracking-tight"
      >
        {t("title")}
      </h2>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_auto]">
        <ul className="grid gap-2 sm:grid-cols-2">
          {FEATURES.map(({ key, icon: Icon }) => (
            <li key={key} className="flex items-center gap-2">
              <Icon aria-hidden className="size-4 shrink-0 text-primary" />
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
          <span className="text-3xl font-bold">
            {formatUsd(priceCents, locale)}
          </span>
          {listPriceCents ? (
            <s className="text-muted-foreground">
              <span className="sr-only">{t("listPrice")} </span>
              {formatUsd(listPriceCents, locale)}
            </s>
          ) : null}
        </p>
        <Link
          href={buyHref(courseLanguage, signedIn)}
          className={buttonVariants({ size: "lg" })}
        >
          {t("start", { language })}
        </Link>
      </div>
    </section>
  );
}
