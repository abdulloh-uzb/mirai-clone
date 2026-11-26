import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { ConfirmForm } from "@/components/admin/confirm-form";
import { AdminField } from "@/components/admin/ui/field";
import { AdminInput } from "@/components/admin/ui/input";
import { AdminSelect } from "@/components/admin/ui/select";
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
    <div className="flex flex-col divide-y [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      <div>
        <ConfirmForm
          action={extendAccess}
          hidden={hidden}
          submitLabel={t("extend")}
          reasonLabel={tc("reason")}
          tone="secondary"
        >
          <AdminField label={t("days")}>
            <AdminInput
              type="number"
              name="days"
              defaultValue={30}
              min={1}
              max={365}
              required
              className="w-24"
            />
          </AdminField>
        </ConfirmForm>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground">
          {t("resets", { count: enrollment.exam_resets })}
        </p>
        <ConfirmForm
          action={grantExamReset}
          hidden={hidden}
          submitLabel={t("grantReset")}
          reasonLabel={tc("reason")}
          tone="secondary"
        />
      </div>

      {canLock ? (
        <div>
          <ConfirmForm
            action={setEnrollmentLock}
            hidden={{ ...hidden, to: "lock" }}
            submitLabel={t("lock")}
            reasonLabel={tc("reason")}
            tone="destructive"
          />
        </div>
      ) : null}
      {canUnlock ? (
        <div>
          <ConfirmForm
            action={setEnrollmentLock}
            hidden={{ ...hidden, to: "unlock" }}
            submitLabel={t("unlock")}
            reasonLabel={tc("reason")}
            tone="secondary"
          />
        </div>
      ) : null}

      <div>
        {enrollment.started_at ? (
          <p className="text-sm text-muted-foreground">{t("languageLocked")}</p>
        ) : (
          <ConfirmForm
            action={changeCourseLanguage}
            hidden={hidden}
            submitLabel={t("changeLanguage")}
            reasonLabel={tc("reason")}
            tone="secondary"
          >
            <AdminSelect
              name="courseLocale"
              defaultValue={enrollment.course_locale}
              aria-label={t("language")}
              wrapperClassName="w-auto"
            >
              {Object.entries(languages).map(([code, l]) => (
                <option key={code} value={code}>
                  {l.nativeName}
                </option>
              ))}
            </AdminSelect>
          </ConfirmForm>
        )}
      </div>
    </div>
  );
}
