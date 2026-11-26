/* eslint-disable @next/next/no-img-element */
// Generated from the reference markup, then edited by hand. Text lives in messages/en.json (Ref.about).
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
export function AboutBody({
  values = {},
}: {
  values?: Record<string, string | number>;
}) {
  const t = useTranslations("Ref.about");
  const v = {
    ...values,
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    license: siteConfig.licenseNumber,
    city: siteConfig.contact.addressLines[1].replace(/ \d+$/, ""),
    address: siteConfig.contact.addressLines.join(", "),
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
  };
  return (
    <>
      <section className="tool-top">
        <div className="tool-top-in">
          <div className="tool-lead">
            <h1>{t("t1", v)}</h1>
            <p className="tool-sub">{t("t2", v)}</p>
            <div className="ab-acts">
              <Link className="btn btn-primary btn-lg" href="/courses">
                {t("t3", v)}
              </Link>
              <Link className="btn btn-secondary btn-lg" href="/contact">
                {t("t4", v)}
              </Link>
            </div>
          </div>
          <div className="tool-art" aria-hidden="true">
            <img
              className="pic-day"
              src="/reference/art/pages/about.webp"
              alt=""
              fetchPriority="high"
            />
            <img
              className="pic-night"
              src="/reference/art/pages/about-night.webp"
              alt=""
              aria-hidden="true"
              fetchPriority="low"
            />
          </div>
        </div>
      </section>
      <section className="ab-sec">
        <div className="ab-facts">
          <div className="ab-fact">
            <b>{t("t5", v)}</b>
            <span>{t("t6", v)}</span>
          </div>
          <div className="ab-fact">
            <b>{t("t7", v)}</b>
            <span>{t("t8", v)}</span>
          </div>
          <div className="ab-fact">
            <b>{t("t9", v)}</b>
            <span>{t("t10", v)}</span>
          </div>
          <div className="ab-fact">
            <b>{t("t11", v)}</b>
            <span>{t("t12", v)}</span>
          </div>
        </div>
      </section>
      <section className="ab-sec" aria-labelledby="abWhy">
        <h2 id="abWhy">{t("t13", v)}</h2>
        <p className="ab-intro">{t("t14", v)}</p>
        <div className="ab-why">
          <div className="ab-cols">
            <div>
              <h3>{t("t15", v)}</h3>
              <ul className="ab-lines">
                <li>
                  <span className="dot" aria-hidden="true"></span>
                  <span>{t("t16", v)}</span>
                </li>
                <li>
                  <span className="dot" aria-hidden="true"></span>
                  <span>{t("t17", v)}</span>
                </li>
                <li>
                  <span className="dot" aria-hidden="true"></span>
                  <span>{t("t18", v)}</span>
                </li>
                <li>
                  <span className="dot" aria-hidden="true"></span>
                  <span>{t("t19", v)}</span>
                </li>
                <li>
                  <span className="dot" aria-hidden="true"></span>
                  <span>{t("t20", v)}</span>
                </li>
              </ul>
            </div>
            <div>
              <h3>{t("t21", v)}</h3>
              <ul className="ab-lines">
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{t("t22", v)}</span>
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{t("t23", v)}</span>
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{t("t24", v)}</span>
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{t("t25", v)}</span>
                </li>
                <li>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{t("t26", v)}</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="ab-reasons">
            <div>
              <h3>{t("t27", v)}</h3>
              <p>{t("t28", v)}</p>
            </div>
            <div>
              <h3>{t("t29", v)}</h3>
              <p>{t("t30", v)}</p>
            </div>
            <div>
              <h3>{t("t31", v)}</h3>
              <p>{t("t32", v)}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="ab-sec" aria-labelledby="abLang">
        <h2 id="abLang">{t("t33", v)}</h2>
        <p className="ab-intro">{t("t34", v)}</p>
        <div className="ab-langs">
          <Link className="ab-lang" href="/courses">
            <span className="ab-pic">
              <img
                src="/reference/course-en.webp"
                alt=""
                width="1448"
                height="1086"
              />
            </span>
            <span className="lwf ab-ln">
              <span className="lwf-flag" aria-hidden="true">
                <span
                  className="flex size-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border/50"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 32 32"
                    className="size-full"
                    focusable="false"
                  >
                    <rect width="32" height="32" fill="#fff" />
                    <rect width="32" height="3" fill="#B22234" />
                    <rect y="6" width="32" height="3" fill="#B22234" />
                    <rect y="12" width="32" height="3" fill="#B22234" />
                    <rect y="18" width="32" height="3" fill="#B22234" />
                    <rect y="24" width="32" height="3" fill="#B22234" />
                    <rect y="30" width="32" height="2" fill="#B22234" />
                    <rect width="14" height="17" fill="#3C3B6E" />
                  </svg>
                </span>
              </span>
              <span lang="en">{t("t35", v)}</span>
            </span>
            <span className="ab-lm">{t("t36", v)}</span>
          </Link>
          <Link className="ab-lang" href="/courses" locale="ja">
            <span className="ab-pic">
              <img
                src="/reference/course-ja.webp"
                alt=""
                width="1448"
                height="1086"
              />
            </span>
            <span className="lwf ab-ln">
              <span className="lwf-flag" aria-hidden="true">
                <span
                  className="flex size-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border/50"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 32 32"
                    className="size-full"
                    focusable="false"
                  >
                    <rect width="32" height="32" fill="#fff" />
                    <circle cx="16" cy="16" r="8" fill="#BC002D" />
                  </svg>
                </span>
              </span>
              <span lang="ja">{t("t37", v)}</span>
            </span>
            <span className="ab-lm">{t("t36", v)}</span>
          </Link>
          <Link className="ab-lang" href="/courses" locale="es">
            <span className="ab-pic">
              <img
                src="/reference/course-es.webp"
                alt=""
                width="1448"
                height="1086"
              />
            </span>
            <span className="lwf ab-ln">
              <span className="lwf-flag" aria-hidden="true">
                <span
                  className="flex size-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border/50"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 32 32"
                    className="size-full"
                    focusable="false"
                  >
                    <rect width="32" height="32" fill="#AA151B" />
                    <rect y="8" width="32" height="16" fill="#F1BF00" />
                  </svg>
                </span>
              </span>
              <span lang="es">{t("t38", v)}</span>
            </span>
            <span className="ab-lm">{t("t36", v)}</span>
          </Link>
          <Link className="ab-lang" href="/courses" locale="ru">
            <span className="ab-pic">
              <img
                src="/reference/course-ru.webp"
                alt=""
                width="1448"
                height="1086"
              />
            </span>
            <span className="lwf ab-ln">
              <span className="lwf-flag" aria-hidden="true">
                <span
                  className="flex size-full shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border/50"
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 32 32"
                    className="size-full"
                    focusable="false"
                  >
                    <rect width="32" height="32" fill="#fff" />
                    <rect y="10.66" width="32" height="10.67" fill="#0039A6" />
                    <rect y="21.33" width="32" height="10.67" fill="#D52B1E" />
                  </svg>
                </span>
              </span>
              <span lang="ru">{t("t39", v)}</span>
            </span>
            <span className="ab-lm">{t("t36", v)}</span>
          </Link>
        </div>
      </section>
      <section className="ab-sec" aria-labelledby="abTrust">
        <div className="ab-trust">
          <div className="ab-cert">
            <img
              className="pic-day"
              src="/reference/art/certificate.webp"
              alt=""
            />
            <img
              className="pic-night"
              src="/reference/art/certificate-night.webp"
              alt=""
              aria-hidden="true"
            />
          </div>
          <div>
            <h2 id="abTrust">{t("t40", v)}</h2>
            <p className="ab-lic">{t("t41", v)}</p>
            <ul className="ab-lines">
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span>{t("t42", v)}</span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span>{t("t43", v)}</span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span>{t("t44", v)}</span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span>{t("t45", v)}</span>
              </li>
              <li>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
                <span>{t("t46", v)}</span>
              </li>
            </ul>
            <div className="ab-acts">
              <Link className="btn btn-primary btn-lg" href="/courses">
                {t("t3", v)}
              </Link>
              <Link className="btn btn-secondary btn-lg" href="/contact">
                {t("t4", v)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
