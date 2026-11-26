import { CheckIcon, LanguagesIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Flag } from "@/components/ref/course-picker";
import { languages } from "@/i18n/languages";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { buyHref } from "@/lib/courses/course-language";

const FEATURES = [
  "defensiveDriving",
  "trafficViolations",
  "driverAwareness",
  "selfPaced",
  "access",
  "interactive",
  "devices",
  "certificate",
  "reported",
  "dmvRules",
] as const;

/**
 * The course language chooser and its panel, in the reference's `.cp` markup.
 * Each row is a link to `?course=<lang>`, so choosing works without JavaScript
 * and the choice survives sign-up.
 */
export async function CourseChooser({
  selected,
  locale,
  signedIn,
  accessDays,
}: {
  selected: Locale;
  locale: Locale;
  signedIn: boolean;
  accessDays: number;
}) {
  const t = await getTranslations({ locale, namespace: "Courses" });
  const language = languages[selected].nativeName;

  return (
    <div className="cp">
      <nav className="cp-list" aria-label={t("languagesLabel")}>
        {routing.locales.map((lang) => {
          const isSelected = lang === selected;
          return (
            <Link
              key={lang}
              href={{ pathname: "/courses", query: { course: lang } }}
              scroll={false}
              lang={lang}
              className="cp-row"
              aria-current={isSelected ? "true" : undefined}
            >
              <Flag code={lang} />
              <span className="cp-n">
                <b>{languages[lang].nativeName}</b>
                {lang === routing.defaultLocale ? (
                  <small lang={locale}>{t("originalCourse")}</small>
                ) : null}
              </span>
              <span className="cp-pillstat live">{t("live")}</span>
              <span className="cp-tick" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                {isSelected ? (
                  <span className="sr-only">{t("selected")}</span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
      <section className="cp-panel" aria-labelledby="course-panel-title">
        <span className="cc-pill">
          <LanguagesIcon aria-hidden />
          {t("panel.pill")}
        </span>
        <h2 className="cp-title" id="course-panel-title">
          {t("panel.title")}
        </h2>
        <ul className="cc-feat">
          {FEATURES.map((key) => (
            <li key={key}>
              <CheckIcon aria-hidden />
              <span>{t(`panel.features.${key}`, { days: accessDays })}</span>
            </li>
          ))}
        </ul>
        <div className="cc-pic cp-pic cp-pic-stack">
          <div className="cp-pic-i" data-on="">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={t("panel.deviceAlt")}
              width="1448"
              height="1086"
              src={`/reference/course-${selected}.webp`}
            />
          </div>
        </div>
        <div className="cp-foot">
          <p className="cp-line" aria-live="polite">
            {t("panel.inLanguage", { language })}
          </p>
          <Link
            className="btn btn-primary btn-lg cp-go"
            href={buyHref(selected, signedIn)}
          >
            {t("panel.start", { language })}
          </Link>
        </div>
      </section>
    </div>
  );
}
