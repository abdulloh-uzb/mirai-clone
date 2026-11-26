/* eslint-disable @next/next/no-img-element */
// Generated from the reference markup, then edited by hand. Text lives in messages/en.json (Ref.home).
import { useTranslations } from "next-intl";
import type { CSSProperties, ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { CountyFilterInput, OpenAssistantButton } from "./ref-client";
export function HomeBody({
  slots = {},
  values = {},
  enrollHref,
  locale,
}: {
  enrollHref: string;
  locale: string;
  slots?: Record<string, ReactNode>;
  values?: Record<string, string | number>;
}) {
  const t = useTranslations("Ref.home");
  const v = {
    ...values,
    name: siteConfig.name,
    shortName: siteConfig.shortName,
    license: siteConfig.licenseNumber,
  };
  return (
    <div className="v2-home-ca">
      <div className="journey" id="journey">
        <svg className="road-svg" id="roadSvg" aria-hidden="true" />
        <svg className="road-svg" id="roadTop" aria-hidden="true" />
        <div className="car" id="car">
          <img src="/reference/car-top.webp" alt="" width="360" height="681" />
        </div>
        <div id="content">
          <section className="hero" aria-labelledby="h1">
            <div className="hero-in">
              <div className="hero-text">
                <div className="hero-chip">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                  <span>{t("t1", v)}</span>
                </div>
                <h1 id="h1" tabIndex={-1}>
                  {t("t2", v)} <em>{t("t3", v)}</em>
                </h1>
                <div className="hero-buy">
                  <div className="t-price">
                    <b>{t("t4", v)}</b>
                    <s aria-label={t("t5", v)}>{t("t6", v)}</s>
                    <span className="pill-green">{t("t7", v)}</span>
                  </div>
                  <div className="hero-cta">
                    <Link className="btn btn-primary btn-lg" href={enrollHref}>
                      {t("t8", v)}
                    </Link>
                    <Link className="btn btn-ghost btn-lg" href="/#courses">
                      {t("t9", v)}
                    </Link>
                  </div>
                </div>
                <ul className="hero-trust">
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-landmark"
                      aria-hidden="true"
                    >
                      <line x1="3" x2="21" y1="22" y2="22" />
                      <line x1="6" x2="6" y1="18" y2="11" />
                      <line x1="10" x2="10" y1="18" y2="11" />
                      <line x1="14" x2="14" y1="18" y2="11" />
                      <line x1="18" x2="18" y1="18" y2="11" />
                      <polygon points="12 2 20 7 4 7" />
                    </svg>
                    {t("t10", v)}
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-star"
                      aria-hidden="true"
                    >
                      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                    </svg>
                    {t("t11", v)}
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-credit-card"
                      aria-hidden="true"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    {t("t12", v)}
                  </li>
                </ul>
                {slots.heroExtra}
              </div>
              <div className="hero-art">
                <img
                  alt={t("t13", v)}
                  width="2000"
                  height="1116"
                  className="ha-day"
                  src="/reference/hero/ca-day-spring.jpg"
                />
                <img
                  alt=""
                  aria-hidden="true"
                  width="2000"
                  height="1116"
                  className="ha-night"
                  src="/reference/hero/ca-night.jpg"
                />
              </div>
            </div>
          </section>
          <section className="start-banner" aria-labelledby="start-h">
            <h2 id="start-h" className="start-h">
              {t("t14", v)}
            </h2>
          </section>
          <section className="stop obj-r" id="s1" data-road=".5,.5">
            <div className="in">
              <div className="stop-text rv">
                <span className="num" data-n="1" aria-hidden="true"></span>
                <p className="kick">{t("t15", v)}</p>
                <h2>{t("t16", v)}</h2>
                <p className="body">{t("t17", v)}</p>
                <div className="extra">
                  <div className="home-lang" id="language">
                    <p className="home-lang-h">{t("t18", v)}</p>
                    <div
                      className="lpills"
                      role="group"
                      aria-label={t("t18", v)}
                    >
                      <Link
                        href="/"
                        locale="en"
                        className="lpill-opt"
                        aria-current={locale === "en" ? "true" : undefined}
                      >
                        <span className="lpo-flag" aria-hidden="true">
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
                              <rect
                                y="6"
                                width="32"
                                height="3"
                                fill="#B22234"
                              />
                              <rect
                                y="12"
                                width="32"
                                height="3"
                                fill="#B22234"
                              />
                              <rect
                                y="18"
                                width="32"
                                height="3"
                                fill="#B22234"
                              />
                              <rect
                                y="24"
                                width="32"
                                height="3"
                                fill="#B22234"
                              />
                              <rect
                                y="30"
                                width="32"
                                height="2"
                                fill="#B22234"
                              />
                              <rect width="14" height="17" fill="#3C3B6E" />
                            </svg>
                          </span>
                        </span>
                        <span lang="en">{t("t19", v)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check lpo-ck"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </Link>
                      <Link
                        href="/"
                        locale="ja"
                        className="lpill-opt"
                        aria-current={locale === "ja" ? "true" : undefined}
                      >
                        <span className="lpo-flag" aria-hidden="true">
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
                        <span lang="ja">{t("t20", v)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check lpo-ck"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </Link>
                      <Link
                        href="/"
                        locale="es"
                        className="lpill-opt"
                        aria-current={locale === "es" ? "true" : undefined}
                      >
                        <span className="lpo-flag" aria-hidden="true">
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
                              <rect
                                y="8"
                                width="32"
                                height="16"
                                fill="#F1BF00"
                              />
                            </svg>
                          </span>
                        </span>
                        <span lang="es">{t("t21", v)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check lpo-ck"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </Link>
                      <Link
                        href="/"
                        locale="ru"
                        className="lpill-opt"
                        aria-current={locale === "ru" ? "true" : undefined}
                      >
                        <span className="lpo-flag" aria-hidden="true">
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
                              <rect
                                y="10.66"
                                width="32"
                                height="10.67"
                                fill="#0039A6"
                              />
                              <rect
                                y="21.33"
                                width="32"
                                height="10.67"
                                fill="#D52B1E"
                              />
                            </svg>
                          </span>
                        </span>
                        <span lang="ru">{t("t22", v)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-check lpo-ck"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t23", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/ticket.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/ticket-night.webp"
                  />
                </span>
              </div>
            </div>
          </section>
          <section className="stop obj-l has-below" id="s2" data-road=".46,.54">
            <div className="in">
              <div className="stop-text rv">
                <span className="num" data-n="2" aria-hidden="true"></span>
                <p className="kick">{t("t24", v)}</p>
                <h2>{t("t25", v)}</h2>
                <p className="body">{t("t26", v)}</p>
                <ul className="step-facts">
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-monitor-smartphone"
                      aria-hidden="true"
                    >
                      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
                      <path d="M10 19v-3.96 3.15" />
                      <path d="M7 19h5" />
                      <rect width="6" height="10" x="16" y="12" rx="2" />
                    </svg>
                    <span>{t("t27", v)}</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-hourglass"
                      aria-hidden="true"
                    >
                      <path d="M5 22h14" />
                      <path d="M5 2h14" />
                      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                    </svg>
                    <span>{t("t28", v)}</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-save"
                      aria-hidden="true"
                    >
                      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                    </svg>
                    <span>{t("t29", v)}</span>
                  </li>
                </ul>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t30", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/lesson.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/lesson-night.webp"
                  />
                </span>
              </div>
            </div>
            <div className="in stop-below" id="courses">
              <div className="band-bare">
                <div className="cp cp-compact">
                  <div
                    className="cp-list"
                    role="radiogroup"
                    aria-label={t("t31", v)}
                  >
                    <Link href="/courses" className="cp-row">
                      <span className="cc-flag cp-flag">
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
                      <span className="cp-n">
                        <b>{t("t19", v)}</b>
                        <small lang="en">{t("t32", v)}</small>
                      </span>
                      <span className="cp-pillstat live">{t("t33", v)}</span>
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
                      </span>
                    </Link>
                    <Link href="/courses" className="cp-row">
                      <span className="cc-flag cp-flag">
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
                      <span className="cp-n">
                        <b>{t("t20", v)}</b>
                        <small lang="en">{t("t34", v)}</small>
                      </span>
                      <span className="cp-pillstat live">{t("t33", v)}</span>
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
                      </span>
                    </Link>
                    <Link href="/courses" className="cp-row">
                      <span className="cc-flag cp-flag">
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
                      <span className="cp-n">
                        <b>{t("t21", v)}</b>
                        <small lang="en">{t("t35", v)}</small>
                      </span>
                      <span className="cp-pillstat live">{t("t33", v)}</span>
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
                      </span>
                    </Link>
                    <Link href="/courses" className="cp-row">
                      <span className="cc-flag cp-flag">
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
                            <rect
                              y="10.66"
                              width="32"
                              height="10.67"
                              fill="#0039A6"
                            />
                            <rect
                              y="21.33"
                              width="32"
                              height="10.67"
                              fill="#D52B1E"
                            />
                          </svg>
                        </span>
                      </span>
                      <span className="cp-n">
                        <b>{t("t22", v)}</b>
                        <small lang="en">{t("t36", v)}</small>
                      </span>
                      <span className="cp-pillstat live">{t("t33", v)}</span>
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
                      </span>
                    </Link>
                  </div>
                  <div className="cp-panel" lang="en">
                    <span className="cc-pill">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-languages"
                        aria-hidden="true"
                      >
                        <path d="m5 8 6 6" />
                        <path d="m4 14 6-6 2-3" />
                        <path d="M2 5h12" />
                        <path d="M7 2h1" />
                        <path d="m22 22-5-10-5 10" />
                        <path d="M14 18h6" />
                      </svg>
                      {t("t37", v)}
                    </span>
                    <h3 className="cp-title">{t("t38", v)}</h3>
                    <ul className="cc-feat">
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-shield"
                          aria-hidden="true"
                        >
                          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        </svg>
                        <span>{t("t39", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-triangle-alert"
                          aria-hidden="true"
                        >
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                        <span>{t("t40", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-eye"
                          aria-hidden="true"
                        >
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>{t("t41", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-clock"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{t("t42", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-calendar-clock"
                          aria-hidden="true"
                        >
                          <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
                          <path d="M16 2v4" />
                          <path d="M8 2v4" />
                          <path d="M3 10h5" />
                          <path d="M17.5 17.5 16 16.3V14" />
                          <circle cx="16" cy="16" r="6" />
                        </svg>
                        <span>{t("t43", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-book-open"
                          aria-hidden="true"
                        >
                          <path d="M12 7v14" />
                          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                        </svg>
                        <span>{t("t44", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-monitor"
                          aria-hidden="true"
                        >
                          <rect width="20" height="14" x="2" y="3" rx="2" />
                          <line x1="8" x2="16" y1="21" y2="21" />
                          <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                        <span>{t("t45", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-award"
                          aria-hidden="true"
                        >
                          <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
                          <circle cx="12" cy="8" r="6" />
                        </svg>
                        <span>{t("t46", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-file-check"
                          aria-hidden="true"
                        >
                          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                          <path d="m9 15 2 2 4-4" />
                        </svg>
                        <span>{t("t47", v)}</span>
                      </li>
                      <li>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-landmark"
                          aria-hidden="true"
                        >
                          <line x1="3" x2="21" y1="22" y2="22" />
                          <line x1="6" x2="6" y1="18" y2="11" />
                          <line x1="10" x2="10" y1="18" y2="11" />
                          <line x1="14" x2="14" y1="18" y2="11" />
                          <line x1="18" x2="18" y1="18" y2="11" />
                          <polygon points="12 2 20 7 4 7" />
                        </svg>
                        <span>{t("t48", v)}</span>
                      </li>
                    </ul>
                    <div className="cc-pic cp-pic cp-pic-stack">
                      <div className="cp-pic-i" data-on="">
                        <img
                          alt={t("t49", v)}
                          width="1448"
                          height="1086"
                          src="/reference/course-en.webp"
                        />
                      </div>
                      <div className="cp-pic-i" aria-hidden="true"></div>
                      <div className="cp-pic-i" aria-hidden="true"></div>
                      <div className="cp-pic-i" aria-hidden="true"></div>
                    </div>
                    <div className="cp-foot">
                      <p className="cp-line" aria-live="polite" lang="en">
                        {t("t50", v)}
                      </p>
                      <Link
                        className="btn btn-primary btn-lg cp-go"
                        href={enrollHref}
                      >
                        {t("t51", v)}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="stop obj-r" id="s4" data-road=".54,.54">
            <div className="in">
              <div className="stop-text rv">
                <span className="num" data-n="3" aria-hidden="true"></span>
                <p className="kick">{t("t52", v)}</p>
                <h2>{t("t53", v)}</h2>
                <p className="body">{t("t54", v)}</p>
                <ul className="step-facts">
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-list-checks"
                      aria-hidden="true"
                    >
                      <path d="m3 17 2 2 4-4" />
                      <path d="m3 7 2 2 4-4" />
                      <path d="M13 6h8" />
                      <path d="M13 12h8" />
                      <path d="M13 18h8" />
                    </svg>
                    <span>{t("t55", v)}</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-target"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>{t("t56", v)}</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-refresh-cw"
                      aria-hidden="true"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                    <span>{t("t57", v)}</span>
                  </li>
                </ul>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t58", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/final-test.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/final-test-night.webp"
                  />
                </span>
              </div>
            </div>
          </section>
          <section className="stop obj-l" id="s5" data-road=".46,.46">
            <div className="in">
              <div className="stop-text rv">
                <span className="num" data-n="4" aria-hidden="true"></span>
                <p className="kick">{t("t59", v)}</p>
                <h2>{t("t60", v)}</h2>
                <p className="body">{t("t61", v)}</p>
                <ul className="step-facts">
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-download"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" x2="12" y1="15" y2="3" />
                    </svg>
                    <span>{t("t62", v)}</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-mail"
                      aria-hidden="true"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>{t("t63", v)}</span>
                  </li>
                  <li>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-landmark"
                      aria-hidden="true"
                    >
                      <line x1="3" x2="21" y1="22" y2="22" />
                      <line x1="6" x2="6" y1="18" y2="11" />
                      <line x1="10" x2="10" y1="18" y2="11" />
                      <line x1="14" x2="14" y1="18" y2="11" />
                      <line x1="18" x2="18" y1="18" y2="11" />
                      <polygon points="12 2 20 7 4 7" />
                    </svg>
                    <span>{t("t64", v)}</span>
                  </li>
                </ul>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t65", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/certificate.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/certificate-night.webp"
                  />
                </span>
              </div>
            </div>
          </section>
          <section className="stop obj-r" id="s6" data-road=".54,.5">
            <div className="in">
              <div className="stop-text rv">
                <p className="kick">{t("t66", v)}</p>
                <h2>{t("t67", v)}</h2>
                <p className="body">{t("t68", v)}</p>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t69", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/filed.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/filed-night.webp"
                  />
                </span>
              </div>
            </div>
          </section>
          <section className="stop court-stop" id="places" data-road=".5,.5">
            <div className="in">
              <div className="court" style={{ gridColumn: "1 / -1" }}>
                <div className="band">
                  <div className="court-grid">
                    <div className="rv">
                      <p className="kick">{t("t70", v)}</p>
                      <h2
                        id="home-places-heading"
                        style={{ fontSize: "var(--t-h2)", fontWeight: "800" }}
                      >
                        {t("t71", v)}
                      </h2>
                      <p
                        className="body"
                        style={{
                          fontSize: "var(--t-body)",
                          color: "var(--v2-muted)",
                          marginTop: "14px",
                        }}
                      >
                        {t("t72", v)}
                      </p>
                      <label className="sr" htmlFor="countySearch">
                        {t("t73", v)}
                      </label>
                      <span className="sfx">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          aria-hidden="true"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="m20 20-4-4" />
                        </svg>
                        <CountyFilterInput
                          placeholder={t("t74", v)}
                          listId="counties"
                        />
                      </span>
                      <div className="hub-links">
                        <p className="links-row">
                          <Link className="linkish" href="/courts">
                            {t("t75", v)}
                          </Link>
                          <Link className="linkish" href="/eligibility">
                            {t("t76", v)}
                          </Link>
                        </p>
                      </div>
                    </div>
                    <ul className="counties" id="counties">
                      {slots.counties}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="stop band-stop" id="pricing" data-road=".46,.54">
            <div className="in" style={{ display: "block" }}>
              <div className="band-head rv">
                <p className="kick">{t("t77", v)}</p>
                <h2>{t("t78", v)}</h2>
                <p className="body">{t("t79", v)}</p>
              </div>
              <div className="band-bare">
                <div className="pr-panel rv">
                  <div className="pr-pass">
                    <p className="pr-pass-k">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-badge-check"
                        aria-hidden="true"
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      {t("t80", v)}
                    </p>
                    <div className="t-price pr-price">
                      <b>{t("t4", v)}</b>
                      <s aria-label={t("t5", v)}>{t("t6", v)}</s>
                      <span className="pill-green">{t("t7", v)}</span>
                    </div>
                    <Link className="btn btn-primary pr-go" href={enrollHref}>
                      {t("t81", v)}
                    </Link>
                    <p className="pr-fee">{t("t82", v)}</p>
                    <p className="pr-stub">
                      <span>{t("t83", v)}</span>
                      <span className="lwf-list">
                        <span className="lwf">
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
                                <rect
                                  y="6"
                                  width="32"
                                  height="3"
                                  fill="#B22234"
                                />
                                <rect
                                  y="12"
                                  width="32"
                                  height="3"
                                  fill="#B22234"
                                />
                                <rect
                                  y="18"
                                  width="32"
                                  height="3"
                                  fill="#B22234"
                                />
                                <rect
                                  y="24"
                                  width="32"
                                  height="3"
                                  fill="#B22234"
                                />
                                <rect
                                  y="30"
                                  width="32"
                                  height="2"
                                  fill="#B22234"
                                />
                                <rect width="14" height="17" fill="#3C3B6E" />
                              </svg>
                            </span>
                          </span>
                          <span lang="en">{t("t19", v)}</span>
                        </span>
                        <span className="lwf">
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
                          <span lang="ja">{t("t20", v)}</span>
                        </span>
                        <span className="lwf">
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
                                <rect
                                  y="8"
                                  width="32"
                                  height="16"
                                  fill="#F1BF00"
                                />
                              </svg>
                            </span>
                          </span>
                          <span lang="es">{t("t21", v)}</span>
                        </span>
                        <span className="lwf">
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
                                <rect
                                  y="10.66"
                                  width="32"
                                  height="10.67"
                                  fill="#0039A6"
                                />
                                <rect
                                  y="21.33"
                                  width="32"
                                  height="10.67"
                                  fill="#D52B1E"
                                />
                              </svg>
                            </span>
                          </span>
                          <span lang="ru">{t("t22", v)}</span>
                        </span>
                      </span>
                    </p>
                  </div>
                  <div className="pr-side">
                    <h3>{t("t84", v)}</h3>
                    <ul className="pr-list">
                      <li>
                        <span className="pr-ic" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-languages"
                          >
                            <path d="m5 8 6 6" />
                            <path d="m4 14 6-6 2-3" />
                            <path d="M2 5h12" />
                            <path d="M7 2h1" />
                            <path d="m22 22-5-10-5 10" />
                            <path d="M14 18h6" />
                          </svg>
                        </span>
                        {t("t85", v)}
                      </li>
                      <li>
                        <span className="pr-ic" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-list-checks"
                          >
                            <path d="m3 17 2 2 4-4" />
                            <path d="m3 7 2 2 4-4" />
                            <path d="M13 6h8" />
                            <path d="M13 12h8" />
                            <path d="M13 18h8" />
                          </svg>
                        </span>
                        {t("t86", v)}
                      </li>
                      <li>
                        <span className="pr-ic" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-file-check2"
                          >
                            <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
                            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                            <path d="m3 15 2 2 4-4" />
                          </svg>
                        </span>
                        {t("t87", v)}
                      </li>
                      <li>
                        <span className="pr-ic" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-landmark"
                          >
                            <line x1="3" x2="21" y1="22" y2="22" />
                            <line x1="6" x2="6" y1="18" y2="11" />
                            <line x1="10" x2="10" y1="18" y2="11" />
                            <line x1="14" x2="14" y1="18" y2="11" />
                            <line x1="18" x2="18" y1="18" y2="11" />
                            <polygon points="12 2 20 7 4 7" />
                          </svg>
                        </span>
                        {t("t88", v)}
                      </li>
                      <li>
                        <span className="pr-ic" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-monitor-smartphone"
                          >
                            <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
                            <path d="M10 19v-3.96 3.15" />
                            <path d="M7 19h5" />
                            <rect width="6" height="10" x="16" y="12" rx="2" />
                          </svg>
                        </span>
                        {t("t89", v)}
                      </li>
                      <li>
                        <span className="pr-ic" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-bot"
                          >
                            <path d="M12 8V4H8" />
                            <rect width="16" height="12" x="4" y="8" rx="2" />
                            <path d="M2 14h2" />
                            <path d="M20 14h2" />
                            <path d="M15 13v2" />
                            <path d="M9 13v2" />
                          </svg>
                        </span>
                        {t("t90", v)}
                      </li>
                    </ul>
                    <div className="pr-refund">
                      <p>
                        <b>{t("t91", v)}</b> {t("t92", v)}
                      </p>
                      <ul>
                        <li>
                          <span className="pr-pct">
                            {t("t93", v)}
                            {t("t94", v)}
                          </span>
                          {t("t95", v)}
                        </li>
                        <li>
                          <span className="pr-pct">
                            {t("t96", v)}
                            {t("t94", v)}
                          </span>
                          {t("t97", v)}
                        </li>
                        <li>
                          <span className="pr-pct off">
                            {t("t98", v)}
                            {t("t94", v)}
                          </span>
                          {t("t99", v)}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="pr-cls" id="classroom">
                    <span className="pr-cls-ic" aria-hidden="true">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-users"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <div className="pr-cls-main">
                      <h3>{t("t100", v)}</h3>
                      <p>{t("t101", v)}</p>
                    </div>
                    <p className="pr-cls-price">
                      <b>
                        {t("t102", v)}
                        {t("t103", v)}
                      </b>
                    </p>
                    <div className="pr-cls-act">{slots.classroomAction}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section
            className="reviews rvf"
            id="reviews"
            data-road=".5,.46"
            aria-label={t("t104", v)}
          >
            <div className="rvf-head">
              <p className="rvf-score">
                <span className="rvf-big">{t("t105", v)}</span>
                <span className="rvf-big-cap">{t("t106", v)}</span>
              </p>
              <div>
                <h2 className="rvf-cap">{t("t107", v)}</h2>
                <div className="rvf-bar" role="img" aria-label={t("t108", v)}>
                  <i className="s5" style={{ flex: "671 1 0" }}></i>
                  <i className="s4" style={{ flex: "17 1 0" }}></i>
                  <i className="s3" style={{ flex: "8 1 0" }}></i>
                </div>
                <ul className="rvf-leg">
                  <li style={{ "--c": "var(--logo-green)" } as CSSProperties}>
                    {t("t109", v)}
                    {t("t110", v)}
                  </li>
                  <li style={{ "--c": "var(--logo-blue)" } as CSSProperties}>
                    {t("t111", v)}
                    {t("t110", v)}
                  </li>
                  <li style={{ "--c": "var(--ink)" } as CSSProperties}>
                    {t("t112", v)}
                    {t("t110", v)}
                  </li>
                </ul>
              </div>
            </div>

            <div className="rvf-hwy">
              <div
                className="rvf-row a"
                tabIndex={0}
                role="region"
                aria-label={t("t114", v)}
                lang="en"
              >
                <div className="rvf-track">
                  <div className="rvf-set">{slots.reviews}</div>
                  <div className="rvf-set" aria-hidden="true">
                    {slots.reviews}
                  </div>
                </div>
              </div>
              <div className="rvf-strip" aria-hidden="true">
                <img
                  className="rvf-car rvf-car-r"
                  src="/reference/car-top-right.png"
                  alt=""
                />
                <img
                  className="rvf-car rvf-car-l"
                  src="/reference/car-top-right.png"
                  alt=""
                />
              </div>
              <div
                className="rvf-row b"
                tabIndex={0}
                role="region"
                aria-label={t("t115", v)}
                lang="en"
              >
                <div className="rvf-track">
                  <div className="rvf-set">{slots.reviews}</div>
                  <div className="rvf-set" aria-hidden="true">
                    {slots.reviews}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="stop obj-l" id="s7" data-road=".46,.46">
            <div className="in">
              <div className="stop-text rv">
                <p className="kick">{t("t116", v)}</p>
                <h2>{t("t117", v)}</h2>
                <p className="body">{t("t118", v)}</p>
                <div className="extra">
                  <OpenAssistantButton
                    className="btn btn-primary"
                    label={t("t119", v)}
                  >
                    {t("t120", v)}
                  </OpenAssistantButton>
                </div>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t121", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/assistant.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/assistant-night.webp"
                  />
                </span>
              </div>
            </div>
          </section>
          <section className="stop obj-r" id="faq" data-road=".54,.54">
            <div className="in">
              <div className="stop-text rv">
                <p className="kick">{t("t122", v)}</p>
                <h2>{t("t123", v)}</h2>
                <div className="extra">
                  <div className="faq">
                    <div className="v2-acc" data-orientation="vertical">
                      {slots.faq}
                    </div>
                    <p className="links-row">
                      <Link className="btn btn-secondary" href="/faq">
                        {t("t124", v)}
                      </Link>
                      <Link className="linkish" href="/contact">
                        {t("t125", v)}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
              <div className="stop-obj">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t126", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/signs.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/signs-night.webp"
                  />
                </span>
              </div>
            </div>
          </section>
          <section className="finish" id="finish" data-road=".5,.5">
            <div className="in">
              <div className="fin-stage">
                <span
                  className="art-box has-night"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    alt={t("t127", v)}
                    width="1800"
                    height="1344"
                    className="rv art-day"
                    src="/reference/art/home/finish.webp"
                  />
                  <img
                    alt=""
                    aria-hidden="true"
                    width="1800"
                    height="1344"
                    className="rv art-night"
                    src="/reference/art/home/finish-night.webp"
                  />
                </span>
                <div className="fin-panel">
                  <h2>{t("t128", v)}</h2>
                  <p className="body">{t("t129", v)}</p>
                  <div className="t-price">
                    <b>{t("t4", v)}</b>
                    <s aria-label={t("t5", v)}>{t("t6", v)}</s>
                    <span className="pill-green">{t("t7", v)}</span>
                  </div>
                  <Link className="btn btn-primary" href={enrollHref}>
                    {t("t81", v)}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <div className="sbar">
        <div className="sbar-p">
          <span>{t("t130", v)}</span>
          <b>{t("t4", v)}</b>
        </div>
        <Link className="btn btn-primary" href={enrollHref}>
          {t("t81", v)}
        </Link>
      </div>
    </div>
  );
}
