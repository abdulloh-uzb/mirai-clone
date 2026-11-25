import { getTranslations } from "next-intl/server";
import { CoursePanel } from "@/components/courses/course-panel";
import { LanguageCards } from "@/components/courses/language-cards";
import { Button } from "@/components/ui/button";
import { languages } from "@/i18n/languages";
import type { Locale } from "@/i18n/routing";
import {
  formatUsd,
  getCourseRules,
  getOnlineCourse,
} from "@/lib/courses/courses";
import { startCheckout } from "@/lib/payments/checkout-actions";

/** The Portal for a Student with no enrollment: choose a language and pay. */
export async function PurchasePanel({
  courseLanguage,
  locale,
  verifyEmailError,
}: {
  courseLanguage: Locale;
  locale: Locale;
  verifyEmailError: boolean;
}) {
  const [t, online, rules] = await Promise.all([
    getTranslations({ locale, namespace: "Checkout" }),
    getOnlineCourse(),
    getCourseRules(),
  ]);

  return (
    <div className="grid gap-6">
      {verifyEmailError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3"
        >
          {t("verifyEmail")}
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <LanguageCards selected={courseLanguage} pathname="/portal" />
        <CoursePanel
          courseLanguage={courseLanguage}
          locale={locale}
          signedIn
          priceCents={online.priceCents}
          listPriceCents={online.listPriceCents}
          accessDays={rules.accessDays}
          action={
            <form action={startCheckout}>
              <input
                type="hidden"
                name="courseLanguage"
                value={courseLanguage}
              />
              <input type="hidden" name="uiLocale" value={locale} />
              <Button type="submit" size="lg">
                {t("pay", {
                  price: formatUsd(online.priceCents, locale),
                  language: languages[courseLanguage].nativeName,
                })}
              </Button>
            </form>
          }
        />
      </div>
    </div>
  );
}
