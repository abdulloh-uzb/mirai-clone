import { CheckIcon, LanguagesIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Flag } from "@/components/ref/course-picker";
import { DMV_RULES_ROW, PANEL_COPY } from "@/components/ref/course-picker-copy";
import { languages } from "@/i18n/languages";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { buyHref } from "@/lib/courses/course-language";

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
  const copy = PANEL_COPY[selected];
  const features = [...copy.features.slice(0, -1), DMV_RULES_ROW[selected]];

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
                <small lang={locale}>
                  {lang === "en"
                    ? t("originalCourse")
                    : t(`languageSub.${lang}`)}
                </small>
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
      <section
        className="cp-panel"
        lang={selected}
        aria-labelledby="course-panel-title"
      >
        <span className="cc-pill">
          <LanguagesIcon aria-hidden />
          {copy.badge}
        </span>
        <h2 className="cp-title" id="course-panel-title">
          {copy.title}
        </h2>
        <ul className="cc-feat">
          {features.map((text, i) => (
            <li key={i}>
              <CheckIcon aria-hidden />
              <span>{text.replace("{days}", String(accessDays))}</span>
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
            {copy.line}
          </p>
          <Link
            className="btn btn-primary btn-lg cp-go"
            href={buyHref(selected, signedIn)}
          >
            {copy.go}
          </Link>
        </div>
      </section>
    </div>
  );
}
