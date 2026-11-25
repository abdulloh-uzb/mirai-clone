import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { languages } from "@/i18n/languages";
import {
  changeCourseLanguage,
  extendAccess,
  grantExamReset,
  setEnrollmentLock,
} from "@/lib/admin/actions";

/** The Admin write forms for one enrollment. Every one needs a reason. */
export async function EnrollmentActions({
  locale,
  enrollment,
}: {
  locale: Locale;
  enrollment: {
    id: string;
    status: string;
    started_at: string | null;
    course_locale: string;
    exam_resets: number;
  };
}) {
  const [t, tc] = await Promise.all([
    getTranslations({ locale, namespace: "Admin.enrollments" }),
    getTranslations({ locale, namespace: "Admin.common" }),
  ]);
  const hidden = { enrollmentId: enrollment.id };
  const canLock = ["active", "paused"].includes(enrollment.status);
  const canUnlock = ["locked", "paused"].includes(enrollment.status);

  return (
    <div className="mt-3 flex flex-col gap-4 rounded-lg border p-4">
      <ConfirmForm
        action={extendAccess}
        hidden={hidden}
        submitLabel={t("extend")}
        reasonLabel={tc("reason")}
      >
        <label className="flex flex-col gap-1 text-sm">
          {t("days")}
          <input
            type="number"
            name="days"
            defaultValue={30}
            min={1}
            max={365}
            required
            className="w-24 rounded-md border bg-background px-2 py-1"
          />
        </label>
      </ConfirmForm>

      <div className="flex items-center gap-3">
        <ConfirmForm
          action={grantExamReset}
          hidden={hidden}
          submitLabel={t("grantReset")}
          reasonLabel={tc("reason")}
        />
        <span className="text-sm text-muted-foreground">
          {t("resets", { count: enrollment.exam_resets })}
        </span>
      </div>

      {canLock ? (
        <ConfirmForm
          action={setEnrollmentLock}
          hidden={{ ...hidden, to: "lock" }}
          submitLabel={t("lock")}
          reasonLabel={tc("reason")}
        />
      ) : null}
      {canUnlock ? (
        <ConfirmForm
          action={setEnrollmentLock}
          hidden={{ ...hidden, to: "unlock" }}
          submitLabel={t("unlock")}
          reasonLabel={tc("reason")}
        />
      ) : null}

      {enrollment.started_at ? (
        <p className="text-sm text-muted-foreground">{t("languageLocked")}</p>
      ) : (
        <ConfirmForm
          action={changeCourseLanguage}
          hidden={hidden}
          submitLabel={t("changeLanguage")}
          reasonLabel={tc("reason")}
        >
          <select
            name="courseLocale"
            defaultValue={enrollment.course_locale}
            aria-label={t("language")}
            className="rounded-md border bg-background px-2 py-1"
          >
            {Object.entries(languages).map(([code, l]) => (
              <option key={code} value={code}>
                {l.nativeName}
              </option>
            ))}
          </select>
        </ConfirmForm>
      )}
    </div>
  );
}
